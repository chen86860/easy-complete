import {
  forwardRef,
  type ReactElement,
  useImperativeHandle,
  useRef,
} from "react";
import {
  List,
  type ListImperativeAPI,
  type RowComponentProps,
} from "react-window";
import { twMerge } from "tailwind-merge";
import { useDynamicResizeObserver } from "../hooks/helpers";

type ResizeHandler = (size: { width?: number; height?: number }) => void;
type RowRenderer = (props: RowComponentProps) => ReactElement | null;

type AutoSizedListProps = {
  children: RowRenderer;
  className?: string;
  itemCount: number;
  itemSize: number;
  onResize?: ResizeHandler;
  width?: number | string;
};

type RowProps = {
  renderRow: RowRenderer;
};

const Row = ({ renderRow, ...props }: RowComponentProps<RowProps>) =>
  renderRow(props);

export type AutoSizedHandleRef = {
  scrollToItem: (index: number) => void;
};

// List will attempt to be size (itemCount * itemSize) but will shrink and
// scroll if necessary.
const AutoSizedList = forwardRef<AutoSizedHandleRef, AutoSizedListProps>(
  function AutoSizedList(
    { children, className, itemCount, itemSize, onResize, width: desiredWidth },
    ref,
  ) {
    const {
      ref: wrapperRef,
      height,
      width,
    } = useDynamicResizeObserver({ onResize });

    const listRef = useRef<ListImperativeAPI>(null);
    useImperativeHandle(ref, () => ({
      scrollToItem: (index) =>
        listRef.current?.scrollToRow({ index, align: "smart" }),
    }));

    return (
      <div
        ref={wrapperRef}
        style={{ flexBasis: itemCount * itemSize }}
        className="min-h-0 min-w-0 flex-shrink"
      >
        <List
          className={twMerge("scrollbar-none", className)}
          listRef={listRef}
          rowComponent={Row}
          rowCount={itemCount}
          rowHeight={itemSize}
          rowProps={{ renderRow: children }}
          style={{
            height: height || 0,
            width: desiredWidth === undefined ? width || 0 : desiredWidth,
          }}
        />
      </div>
    );
  },
);

export default AutoSizedList;
