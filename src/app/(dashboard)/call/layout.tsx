interface Props {
  children: React.ReactNode;
}
export default function Layout({ children }: Props) {
  return <div className="h-dvh bg-black">{children}</div>;
}
