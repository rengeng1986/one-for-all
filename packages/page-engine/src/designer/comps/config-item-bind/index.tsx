import React from 'react';
import { observer } from 'mobx-react';
import cs from 'classnames';
import { get } from 'lodash';

import { Icon, Tooltip } from '@ofa/ui';
import { useCtx } from '@ofa/page-engine';
import { NodePropType } from '@ofa/render-engine';

interface Props {
  name: string; // bind field name
  className?: string;
  isLoopNode?: boolean;
}

const iterableStateType = [
  NodePropType.SharedStateProperty,
  NodePropType.APIResultProperty,
  NodePropType.ConstantProperty,
];

function ConfigItemBind({ name, isLoopNode }: Props): JSX.Element {
  const { designer, page } = useCtx();
  let bound = false;
  if (isLoopNode) {
    // if bind shared state, loop node iterableState will label as shared_property
    // if bind api state, loop node iterableState will label as api_result_property
    const iterType = get(page.activeElem, 'iterableState.type');
    bound = iterableStateType.includes(iterType);
  } else {
    bound = get(page.activeElem, `props.${name}.type`) === NodePropType.SharedStateProperty;
  }

  function handleUnbind(): void {
    if (isLoopNode) {
      // replace loop node with inner normal node, detach iterable state prop
    } else {
      const { fallback } = get(page.activeElem, `props.${name}`, {});
      page.updateElemProperty(page.activeElem.id, `props.${name}`, {
        type: NodePropType.ConstantProperty,
        value: fallback,
      });
    }
  }

  return (
    <div className='inline-flex items-center'>
      <Tooltip position='top' label={bound ? '编辑绑定' : '绑定变量'}>
        <Icon
          name="code"
          color="gray"
          clickable
          onClick={()=> designer.openDataBinding(name, isLoopNode)}
          className={cs('mr-8', bound ? 'bg-blue-200' : '')}
        />
      </Tooltip>
      {bound && (
        <Tooltip position='top' label='解绑'>
          <Icon
            name='link'
            clickable
            onClick={handleUnbind}
          />
        </Tooltip>
      )}
    </div>
  );
}

export default observer(ConfigItemBind);
