import type { ComponentType, PropsWithChildren } from 'react';
import type { MarkdownProps } from 'react-native-markdown-display';
import _Markdown from 'react-native-markdown-display';

type MarkdownWithChildrenT = ComponentType<PropsWithChildren<MarkdownProps>>;
const CustomMarkdown = _Markdown as MarkdownWithChildrenT;

export default CustomMarkdown;
