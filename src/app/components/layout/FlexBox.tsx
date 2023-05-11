interface FlexProps {
  direction: "row" | "column";
  children: React.ReactNode;
  className?: string;
  alignItems?: "flex-start" | "flex-end" | "center" | "baseline" | "stretch";
  justifyContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly";
  flexWrap?: "nowrap" | "wrap" | "wrap-reverse";
  flexFlow?: string;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: string;
  flex?: string;
  order?: number;
  alignSelf?:
    | "auto"
    | "flex-start"
    | "flex-end"
    | "center"
    | "baseline"
    | "stretch";
  alignContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "stretch";
  style?: React.CSSProperties;
  width?: string;
  height?: string;
}

const Flex: React.FC<FlexProps> = ({
  direction,
  children,
  className,
  alignItems,
  justifyContent,
  flexWrap,
  flexFlow,
  flexGrow,
  flexShrink,
  flexBasis,
  flex,
  order,
  alignSelf,
  alignContent,
  style,
  width,
  height,
}) => {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: direction,
        alignItems,
        justifyContent,
        flexWrap,
        flexFlow,
        flexGrow,
        flexShrink,
        flexBasis,
        flex,
        order,
        alignSelf,
        alignContent,
        width,
        height,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default Flex;
