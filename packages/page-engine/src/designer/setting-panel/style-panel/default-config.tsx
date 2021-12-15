export const DEFAULT_STYLE_CONFIG = {
  // width, height
  width: 83,
  height: 32,
  // margin
  marginTop: 0,
  marginLeft: 0,
  marginRight: 0,
  marginBottom: 0,
  // border
  borderTopWidth: 4,
  borderLeftWidth: 1,
  borderRightWidth: 1,
  borderBottomWidth: 1,
  // padding
  paddingTop: 0,
  paddingLeft: 0,
  paddingRight: 0,
  paddingBottom: 0,
  // font
  fontSize: 14,
  lineHeight: 20,
  fontWeight: 400,
  color: '#ffffff',
  // background
  backgroundColor: '#ffffff',
  // border
  borderWidth: 1,
  borderRadius: 4,
  borderTopLeftRadius: 2,
  borderTopRightRadius: 2,
  borderBottomLeftRadius: 2,
  borderBottomRightRadius: 2,
};

const STYLE_NUMBER = [
  'width', 'height',
  'marginTop', 'marginLeft', 'marginRight', 'marginBottom', 'borderTopWidth', 'borderLeftWidth',
  'borderRightWidth', 'borderBottomWidth', 'paddingTop', 'paddingLeft', 'paddingRight', 'paddingBottom',
];

export const formatStyles = (styles: Record<string, string | number>): Record<string, string | number> => {
  const newStyles: Record<string, string | number> = {};
  if (typeof(styles) !== 'object' || styles === null) {
    return newStyles;
  }

  Object.entries(styles).forEach((style) => {
    const [key, value] = style;
    if (STYLE_NUMBER.includes(key)) {
      newStyles[key] = Number(value) || 0;
      return;
    }
    newStyles[key] = value;
  });

  return newStyles;
};
