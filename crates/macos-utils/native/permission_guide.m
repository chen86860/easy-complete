// Floating guide beside System Settings' Accessibility pane, adapted from
// anomalyco/hex (native/permission_guide.m). It opens the pane, then offers the
// running app as a tile the user drags into the list, and closes once
// Accessibility is granted or System Settings goes away.

#import <AppKit/AppKit.h>
#import <ApplicationServices/ApplicationServices.h>
#import <CoreGraphics/CoreGraphics.h>
#import <CoreImage/CoreImage.h>
#import <QuartzCore/QuartzCore.h>

static NSPanel *guidePanel;
static NSTimer *guideTimer;
static BOOL sawSettingsWindow;
static NSView *guideTile;

static void closeGuide(void);

/// Target for the guide's close button.
@interface ECGuideCloser : NSObject
- (void)close:(id)sender;
@end

@implementation ECGuideCloser
- (void)close:(id)sender {
    closeGuide();
}
@end

static ECGuideCloser *guideCloser;

/// The tile flies from the click in our window to its place in the guide, so
/// the eye can follow it to System Settings.
static NSPanel *flightPanel;
static CALayer *flightLayer;
static NSTimer *flightTimer;
static NSPoint flightOrigin;
static CFTimeInterval flightShownAt;
static CFTimeInterval flightStartedAt;
static const CGFloat flightPadding = 40;
static const CFTimeInterval flightLift = 0.18;
static const CFTimeInterval flightDuration = 0.62;
/// Settings that has not opened by then gets no flight.
static const CFTimeInterval flightPatience = 4;

static NSString *const settingsBundleID = @"com.apple.systempreferences";
/// Bumped by every pane request, so an older request's retries stand down.
static NSUInteger settingsRequest;

@interface ECDragView : NSView <NSDraggingSource>
@property(nonatomic, strong) NSURL *bundleURL;
@property(nonatomic, strong) NSImage *appIcon;
@property(nonatomic, copy) NSString *appName;
@property(nonatomic, strong) NSEvent *mouseDownEvent;
@end

static NSURL *runningBundleURL(void) {
    return NSBundle.mainBundle.bundleURL.standardizedURL;
}

static BOOL runningFromAppBundle(void) {
    return [runningBundleURL().pathExtension.lowercaseString isEqualToString:@"app"];
}

/// The name System Settings lists the app under.
static NSString *appName(NSURL *bundleURL) {
    NSString *name = [[NSFileManager defaultManager] displayNameAtPath:bundleURL.path];
    if ([name.pathExtension.lowercaseString isEqualToString:@"app"]) {
        name = name.stringByDeletingPathExtension;
    }
    return name.length > 0 ? name : @"Easy Complete";
}

static BOOL systemPrefersChinese(void) {
    NSString *language = NSLocale.preferredLanguages.firstObject;
    return [language.lowercaseString hasPrefix:@"zh"];
}

/// Mirrors the dashboard's `dashboard.language`: 0 system, 1 en, 2 zh-CN.
static BOOL guideInChinese(int locale) {
    switch (locale) {
        case 1:
            return NO;
        case 2:
            return YES;
        default:
            return systemPrefersChinese();
    }
}

static BOOL isDark(NSAppearance *appearance) {
    NSAppearanceName match = [appearance bestMatchFromAppearancesWithNames:@[
        NSAppearanceNameAqua,
        NSAppearanceNameDarkAqua,
    ]];
    return [match isEqualToString:NSAppearanceNameDarkAqua];
}

/// The app's tile as System Settings will list it: icon and name.
static void drawTile(NSRect bounds, NSImage *icon, NSString *name, BOOL dark) {
    NSBezierPath *background = [NSBezierPath bezierPathWithRoundedRect:bounds xRadius:8 yRadius:8];
    [[NSColor colorWithWhite:(dark ? 0.18 : 0.89) alpha:1] setFill];
    [background fill];
    [[NSColor colorWithWhite:(dark ? 1 : 0) alpha:0.10] setStroke];
    background.lineWidth = 1;
    [background stroke];

    [icon drawInRect:NSMakeRect(10, 6, 32, 32)];
    NSDictionary *attributes = @{
        NSFontAttributeName: [NSFont systemFontOfSize:13 weight:NSFontWeightSemibold],
        NSForegroundColorAttributeName: [NSColor colorWithWhite:(dark ? 0.94 : 0.12) alpha:1],
    };
    [name drawAtPoint:NSMakePoint(52, 14) withAttributes:attributes];
}

@implementation ECDragView

- (instancetype)initWithFrame:(NSRect)frame bundleURL:(NSURL *)bundleURL {
    self = [super initWithFrame:frame];
    if (self) {
        _bundleURL = bundleURL;
        _appIcon = [[NSWorkspace sharedWorkspace] iconForFile:bundleURL.path];
        _appIcon.size = NSMakeSize(32, 32);
        _appName = appName(bundleURL);
    }
    return self;
}

- (BOOL)acceptsFirstMouse:(NSEvent *)event {
    return YES;
}

- (void)resetCursorRects {
    [self addCursorRect:self.bounds cursor:NSCursor.openHandCursor];
}

- (void)drawRect:(NSRect)dirtyRect {
    [super drawRect:dirtyRect];
    drawTile(self.bounds, self.appIcon, self.appName, isDark(self.effectiveAppearance));
}

- (void)mouseDown:(NSEvent *)event {
    self.mouseDownEvent = event;
}

- (void)mouseDragged:(NSEvent *)event {
    if (self.mouseDownEvent == nil) {
        return;
    }
    CGFloat dx = event.locationInWindow.x - self.mouseDownEvent.locationInWindow.x;
    CGFloat dy = event.locationInWindow.y - self.mouseDownEvent.locationInWindow.y;
    if (hypot(dx, dy) < 3) {
        return;
    }

    // The app bundle's file URL is what the "+" file picker would hand the
    // list, so dropping it adds and switches on the app.
    NSDraggingItem *item = [[NSDraggingItem alloc] initWithPasteboardWriter:self.bundleURL];
    NSBitmapImageRep *representation = [self bitmapImageRepForCachingDisplayInRect:self.bounds];
    [self cacheDisplayInRect:self.bounds toBitmapImageRep:representation];
    NSImage *snapshot = [[NSImage alloc] initWithSize:self.bounds.size];
    [snapshot addRepresentation:representation];
    [item setDraggingFrame:self.bounds contents:snapshot];

    NSDraggingSession *session = [self beginDraggingSessionWithItems:@[ item ]
                                                               event:self.mouseDownEvent
                                                              source:self];
    session.animatesToStartingPositionsOnCancelOrFail = YES;
    session.draggingFormation = NSDraggingFormationNone;
    self.mouseDownEvent = nil;
}

- (NSDragOperation)draggingSession:(NSDraggingSession *)session
    sourceOperationMaskForDraggingContext:(NSDraggingContext)context {
    return NSDragOperationCopy;
}

@end

static CGRect currentSettingsFrame(void) {
    // Match by process, not kCGWindowOwnerName: the owner name is localized
    // ("系统设置" on a Chinese system), so a name match finds nothing there.
    NSMutableSet<NSNumber *> *pids = [NSMutableSet set];
    for (NSRunningApplication *app in
         [NSRunningApplication runningApplicationsWithBundleIdentifier:settingsBundleID]) {
        [pids addObject:@(app.processIdentifier)];
    }
    if (pids.count == 0) {
        return CGRectNull;
    }
    NSArray *windows = CFBridgingRelease(CGWindowListCopyWindowInfo(
        kCGWindowListOptionOnScreenOnly | kCGWindowListExcludeDesktopElements, kCGNullWindowID));
    CGRect best = CGRectNull;
    for (NSDictionary *window in windows) {
        if (![pids containsObject:@([window[(id)kCGWindowOwnerPID] intValue])]) {
            continue;
        }
        if ([window[(id)kCGWindowLayer] integerValue] != 0) {
            continue;
        }
        CGRect frame;
        if (!CGRectMakeWithDictionaryRepresentation(
                (__bridge CFDictionaryRef)window[(id)kCGWindowBounds], &frame)) {
            continue;
        }
        if (frame.size.width < 300 || frame.size.height < 200) {
            continue;
        }
        if (CGRectIsNull(best) ||
            frame.size.width * frame.size.height > best.size.width * best.size.height) {
            best = frame;
        }
    }
    return best;
}

static BOOL settingsHasWindow(void) {
    NSArray<NSRunningApplication *> *apps =
        [NSRunningApplication runningApplicationsWithBundleIdentifier:settingsBundleID];
    if (apps.count == 0) {
        return NO;
    }
    pid_t pid = apps.firstObject.processIdentifier;
    NSArray *windows = CFBridgingRelease(CGWindowListCopyWindowInfo(
        kCGWindowListOptionOnScreenOnly | kCGWindowListExcludeDesktopElements, kCGNullWindowID));
    for (NSDictionary *window in windows) {
        if ([window[(id)kCGWindowOwnerPID] intValue] == pid &&
            [window[(id)kCGWindowLayer] integerValue] == 0) {
            return YES;
        }
    }
    return NO;
}

/// Opens System Settings at `url`. A System Settings that isn't running yet
/// drops the pane in the URL while it restores the pane it showed last, so
/// after a cold launch the URL goes again once its window is up and settled.
static void openSettingsPane(NSURL *url) {
    BOOL cold =
        [NSRunningApplication runningApplicationsWithBundleIdentifier:settingsBundleID].count == 0;
    NSUInteger request = ++settingsRequest;
    [[NSWorkspace sharedWorkspace] openURL:url];
    if (!cold) {
        return;
    }
    __block NSUInteger polls = 0;
    [NSTimer scheduledTimerWithTimeInterval:0.1
                                    repeats:YES
                                      block:^(NSTimer *timer) {
        polls += 1;
        if (request != settingsRequest || polls > 100) {
            [timer invalidate];
            return;
        }
        if (!settingsHasWindow()) {
            return;
        }
        [timer invalidate];
        for (NSNumber *delay in @[ @0.35, @1.2 ]) {
            dispatch_after(
                dispatch_time(DISPATCH_TIME_NOW, (int64_t)(delay.doubleValue * NSEC_PER_SEC)),
                dispatch_get_main_queue(), ^{
                    if (request == settingsRequest) {
                        [[NSWorkspace sharedWorkspace] openURL:url];
                    }
                });
        }
    }];
}

static NSRect appKitFrame(CGRect frame) {
    NSScreen *primary = NSScreen.screens.firstObject;
    if (primary == nil) {
        return NSRectFromCGRect(frame);
    }
    return NSMakeRect(frame.origin.x, primary.frame.size.height - frame.origin.y - frame.size.height,
                      frame.size.width, frame.size.height);
}

static void endFlight(void) {
    [flightTimer invalidate];
    flightTimer = nil;
    [flightPanel orderOut:nil];
    flightPanel = nil;
    flightLayer = nil;
    guideTile.hidden = NO;
    guidePanel.alphaValue = 1;
}

static void closeGuide(void) {
    endFlight();
    [guideTimer invalidate];
    guideTimer = nil;
    [guidePanel orderOut:nil];
    guidePanel = nil;
    guideTile = nil;
    sawSettingsWindow = NO;
}

static CGFloat clamp01(CGFloat value) {
    return MIN(MAX(value, 0), 1);
}

static CGFloat easeInOutCubic(CGFloat t) {
    return t < 0.5 ? 4 * t * t * t : 1 - pow(-2 * t + 2, 3) / 2;
}

static CGFloat easeOutCubic(CGFloat t) {
    return 1 - pow(1 - t, 3);
}

/// Where the tile lands: its slot in the guide, in screen coordinates.
static NSPoint tileTarget(void) {
    NSRect slot = [guideTile convertRect:guideTile.bounds toView:nil];
    NSRect screen = [guidePanel convertRectToScreen:slot];
    return NSMakePoint(NSMidX(screen), NSMidY(screen));
}

static void placeFlight(NSPoint center, CGFloat scale, CGFloat blur, CGFloat opacity) {
    NSSize size = flightPanel.frame.size;
    [flightPanel setFrameOrigin:NSMakePoint(center.x - size.width / 2, center.y - size.height / 2)];
    [CATransaction begin];
    [CATransaction setDisableActions:YES];
    flightLayer.transform = CATransform3DMakeScale(scale, scale, 1);
    flightLayer.opacity = (float)opacity;
    [flightLayer setValue:@(blur) forKeyPath:@"filters.blur.inputRadius"];
    [CATransaction commit];
}

static void stepFlight(void) {
    CFTimeInterval now = CACurrentMediaTime();
    if (flightStartedAt == 0) {
        // Lifted out of the row, waiting for System Settings to open.
        if (now - flightShownAt > flightPatience) {
            endFlight();
            return;
        }
        CGFloat t = easeOutCubic(clamp01((now - flightShownAt) / flightLift));
        placeFlight(NSMakePoint(flightOrigin.x, flightOrigin.y + 12 * t), 0.7 + 0.1 * t,
                    4 * (1 - t), t);
        return;
    }
    CGFloat t = clamp01((now - flightStartedAt) / flightDuration);
    CGFloat e = easeInOutCubic(t);
    NSPoint start = NSMakePoint(flightOrigin.x, flightOrigin.y + 12);
    NSPoint end = tileTarget();
    CGFloat distance = hypot(end.x - start.x, end.y - start.y);
    NSPoint control =
        NSMakePoint((start.x + end.x) / 2, MAX(start.y, end.y) + MIN(160, distance * 0.25));
    CGFloat u = 1 - e;
    NSPoint point = NSMakePoint(u * u * start.x + 2 * u * e * control.x + e * e * end.x,
                                u * u * start.y + 2 * u * e * control.y + e * e * end.y);
    placeFlight(point, 0.8 + 0.2 * e, 6 * sin(M_PI * e), 1);
    guidePanel.alphaValue = easeOutCubic(clamp01((t - 0.45) / 0.55));
    if (t >= 1) {
        endFlight();
    }
}

/// Whether the click that asked for the guide was in one of our windows.
static BOOL clickInOwnWindow(NSPoint point) {
    for (NSWindow *window in NSApp.windows) {
        if (window.visible && window != guidePanel && window != flightPanel &&
            NSPointInRect(point, window.frame)) {
            return YES;
        }
    }
    return NO;
}

/// Lifts a copy of the tile out of our window at `origin`.
static void beginFlight(NSPoint origin, NSURL *bundleURL, NSSize tileSize) {
    flightOrigin = origin;
    flightShownAt = CACurrentMediaTime();
    flightStartedAt = 0;
    NSImage *icon = [[NSWorkspace sharedWorkspace] iconForFile:bundleURL.path];
    icon.size = NSMakeSize(32, 32);
    NSString *name = appName(bundleURL);
    BOOL dark = isDark(NSApp.effectiveAppearance);
    NSImage *image = [NSImage imageWithSize:tileSize
                                    flipped:NO
                             drawingHandler:^BOOL(NSRect rect) {
        drawTile(rect, icon, name, dark);
        return YES;
    }];

    NSSize size = NSMakeSize(tileSize.width + 2 * flightPadding, tileSize.height + 2 * flightPadding);
    flightPanel = [[NSPanel alloc]
        initWithContentRect:NSMakeRect(0, 0, size.width, size.height)
                  styleMask:NSWindowStyleMaskBorderless | NSWindowStyleMaskNonactivatingPanel
                    backing:NSBackingStoreBuffered
                      defer:NO];
    flightPanel.level = NSFloatingWindowLevel + 1;
    flightPanel.collectionBehavior =
        NSWindowCollectionBehaviorCanJoinAllSpaces | NSWindowCollectionBehaviorFullScreenAuxiliary;
    flightPanel.opaque = NO;
    flightPanel.backgroundColor = NSColor.clearColor;
    flightPanel.hasShadow = NO;
    flightPanel.ignoresMouseEvents = YES;
    flightPanel.hidesOnDeactivate = NO;
    flightPanel.releasedWhenClosed = NO;

    NSView *host = [[NSView alloc] initWithFrame:NSMakeRect(0, 0, size.width, size.height)];
    host.layer = [CALayer layer];
    host.wantsLayer = YES;
    host.layerUsesCoreImageFilters = YES;
    flightLayer = [CALayer layer];
    flightLayer.bounds = CGRectMake(0, 0, tileSize.width, tileSize.height);
    flightLayer.position = CGPointMake(size.width / 2, size.height / 2);
    flightLayer.contents = image;
    flightLayer.contentsScale = NSScreen.mainScreen.backingScaleFactor;
    flightLayer.shadowOpacity = 0.25;
    flightLayer.shadowRadius = 12;
    flightLayer.shadowOffset = CGSizeMake(0, -6);
    CIFilter *blur = [CIFilter filterWithName:@"CIGaussianBlur"];
    blur.name = @"blur";
    [blur setValue:@0 forKey:kCIInputRadiusKey];
    flightLayer.filters = @[ blur ];
    [host.layer addSublayer:flightLayer];
    flightPanel.contentView = host;

    placeFlight(origin, 0.7, 4, 0);
    [flightPanel orderFrontRegardless];
    flightTimer = [NSTimer timerWithTimeInterval:1.0 / 120
                                         repeats:YES
                                           block:^(NSTimer *timer) {
        (void)timer;
        stepFlight();
    }];
    [[NSRunLoop mainRunLoop] addTimer:flightTimer forMode:NSRunLoopCommonModes];
}

static void updateGuidePosition(void) {
    if (AXIsProcessTrusted()) {
        closeGuide();
        return;
    }
    CGRect quartzFrame = currentSettingsFrame();
    if (CGRectIsNull(quartzFrame)) {
        if (sawSettingsWindow) {
            closeGuide();
        }
        return;
    }
    sawSettingsWindow = YES;
    // Only float beside System Settings while it is in front, so the guide
    // never covers other apps when Settings sits behind them. Dragging from
    // the non-activating panel leaves Settings frontmost.
    NSRunningApplication *front = NSWorkspace.sharedWorkspace.frontmostApplication;
    if (![front.bundleIdentifier isEqualToString:settingsBundleID]) {
        if (flightPanel != nil && flightStartedAt != 0) {
            endFlight();
        }
        [guidePanel orderOut:nil];
        return;
    }
    NSRect settings = appKitFrame(quartzFrame);
    NSSize size = guidePanel.frame.size;
    NSScreen *screen = nil;
    for (NSScreen *candidate in NSScreen.screens) {
        if (NSIntersectsRect(candidate.frame, settings)) {
            screen = candidate;
            break;
        }
    }
    if (screen == nil) {
        screen = NSScreen.mainScreen;
    }
    NSRect visible = screen != nil ? screen.visibleFrame : settings;
    CGFloat x = NSMaxX(settings) - size.width - 16;
    // Just above the bottom edge, clear of the list's +/− buttons.
    CGFloat y = NSMinY(settings) + 20;
    x = MIN(MAX(x, NSMinX(visible) + 8), NSMaxX(visible) - size.width - 8);
    y = MIN(MAX(y, NSMinY(visible) + 8), NSMaxY(visible) - size.height - 8);
    [guidePanel setFrameOrigin:NSMakePoint(x, y)];
    if (flightPanel != nil && flightStartedAt == 0) {
        flightStartedAt = CACurrentMediaTime();
    }
    [guidePanel orderFrontRegardless];
}

static void showGuideOnMain(BOOL chinese) {
    NSPoint click = NSEvent.mouseLocation;
    BOOL fly = clickInOwnWindow(click) &&
               !NSWorkspace.sharedWorkspace.accessibilityDisplayShouldReduceMotion;
    closeGuide();

    openSettingsPane([NSURL URLWithString:@"x-apple.systempreferences:"
                                          @"com.apple.settings.PrivacySecurity.extension?"
                                          @"Privacy_Accessibility"]);

    NSURL *bundleURL = runningBundleURL();
    // The pane's title right above already names the list (renamed on macOS
    // 27), so the instruction stays short enough for a panel that fits the
    // list column.
    NSString *format = chinese ? @"↑  将 %@ 拖到上方列表中" : @"↑  Drag %@ into the list above";
    NSString *text = [NSString stringWithFormat:format, appName(bundleURL)];
    NSFont *instructionFont = [NSFont systemFontOfSize:13 weight:NSFontWeightMedium];
    NSSize panelSize = NSMakeSize(480, 116);
    guidePanel = [[NSPanel alloc]
        initWithContentRect:NSMakeRect(0, 0, panelSize.width, panelSize.height)
                  styleMask:NSWindowStyleMaskBorderless | NSWindowStyleMaskNonactivatingPanel |
                            NSWindowStyleMaskFullSizeContentView
                    backing:NSBackingStoreBuffered
                      defer:NO];
    guidePanel.floatingPanel = YES;
    guidePanel.level = NSFloatingWindowLevel;
    guidePanel.collectionBehavior =
        NSWindowCollectionBehaviorCanJoinAllSpaces | NSWindowCollectionBehaviorFullScreenAuxiliary;
    guidePanel.opaque = NO;
    guidePanel.backgroundColor = NSColor.clearColor;
    guidePanel.hasShadow = YES;
    guidePanel.hidesOnDeactivate = NO;
    guidePanel.releasedWhenClosed = NO;

    NSView *content =
        [[NSView alloc] initWithFrame:NSMakeRect(0, 0, panelSize.width, panelSize.height)];
    content.wantsLayer = YES;
    content.layer.backgroundColor = NSColor.controlBackgroundColor.CGColor;
    content.layer.cornerRadius = 20;
    content.layer.borderWidth = 1;
    content.layer.borderColor = [NSColor colorWithWhite:0 alpha:0.10].CGColor;

    NSTextField *instruction = [NSTextField labelWithString:text];
    instruction.frame = NSMakeRect(18, 73, panelSize.width - 36 - 28, 24);
    instruction.font = instructionFont;
    instruction.lineBreakMode = NSLineBreakByTruncatingTail;
    instruction.textColor = NSColor.labelColor;
    [content addSubview:instruction];

    if (guideCloser == nil) {
        guideCloser = [ECGuideCloser new];
    }
    NSImage *closeImage = [NSImage imageWithSystemSymbolName:@"xmark.circle.fill"
                                    accessibilityDescription:(chinese ? @"关闭" : @"Close")];
    NSButton *closeButton = [NSButton buttonWithImage:closeImage
                                               target:guideCloser
                                               action:@selector(close:)];
    closeButton.bordered = NO;
    closeButton.imageScaling = NSImageScaleProportionallyUpOrDown;
    closeButton.contentTintColor = NSColor.tertiaryLabelColor;
    closeButton.toolTip = chinese ? @"关闭" : @"Close";
    closeButton.frame = NSMakeRect(panelSize.width - 18 - 20, 75, 20, 20);
    [content addSubview:closeButton];

    ECDragView *dragView =
        [[ECDragView alloc] initWithFrame:NSMakeRect(18, 17, panelSize.width - 36, 44)
                                bundleURL:bundleURL];
    [content addSubview:dragView];
    guideTile = dragView;
    guidePanel.contentView = content;
    if (fly) {
        guideTile.hidden = YES;
        guidePanel.alphaValue = 0;
        beginFlight(click, bundleURL, guideTile.frame.size);
    }

    guideTimer = [NSTimer scheduledTimerWithTimeInterval:0.12
                                                 repeats:YES
                                                   block:^(NSTimer *timer) {
        (void)timer;
        updateGuidePosition();
    }];
    updateGuidePosition();
}

/// Opens the Accessibility pane with the drag guide beside it. Safe to call
/// from any thread; the UI work hops to the main queue. Returns false, doing
/// nothing, outside a `.app` bundle, which has nothing to drag. `locale` is
/// 0 system, 1 en, 2 zh-CN, matching `dashboard.language`.
bool ec_show_accessibility_guide(int locale) {
    if (!runningFromAppBundle()) {
        return false;
    }
    BOOL chinese = guideInChinese(locale);
    if (NSThread.isMainThread) {
        showGuideOnMain(chinese);
    } else {
        dispatch_async(dispatch_get_main_queue(), ^{
            showGuideOnMain(chinese);
        });
    }
    return true;
}
