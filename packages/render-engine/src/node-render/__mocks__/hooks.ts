import { CTX, Instantiated, NodePropType, NodeType, SchemaNode } from '../../types';
import dummyCTX from '../../ctx/__tests__/fixtures/dummy-ctx';

export function useLifecycleHook(): void {
  return;
}

type RefResult = { refCTX: CTX; refNode: SchemaNode<Instantiated>; }

export function useRefResult(schemaID: string): RefResult | undefined {
  if (schemaID === 'undefined') {
    return;
  }

  return {
    refCTX: dummyCTX,
    refNode: {
      id: 'dummy',
      type: NodeType.HTMLNode,
      name: 'div',
      props: {
        id: {
          type: NodePropType.ConstantProperty,
          value: 'dummy',
        },
        children: {
          type: NodePropType.ConstantProperty,
          value: 'this is dummy node',
        },
      },
    },
  };
}