import appLogo from "../../../../crates/fig_desktop/icons/128x128@2x.png";

export function AppLogo({ size = 64 }: { size?: number }) {
  return (
    <img
      src={appLogo}
      alt=""
      width={size}
      height={size}
      className="block rounded-[14px]"
    />
  );
}
