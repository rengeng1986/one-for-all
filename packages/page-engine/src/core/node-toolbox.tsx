import React, { useEffect, useRef, useState, useImperativeHandle } from 'react';
import { observer } from 'mobx-react';

import { useCtx } from '@ofa/page-engine';
import { Icon, Popper } from '@ofa/ui';

interface Props {
  className?: string;
}

function NodeToolbox(props: Props, ref: any): JSX.Element {
  const popperRef = useRef<Popper>(null);
  const reference = useRef<any>(null);
  const { page } = useCtx();
  const [seat, setSeat] = useState({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });

  useImperativeHandle(ref, () => {
    return {
      computedPlace,
    };
  });

  useEffect(()=> {
    // 监听浏览器窗口变动
    window.addEventListener('resize', computedPlace);
  }, []);

  useEffect(() => {
    computedPlace();
  }, [page.activeElemId]);

  function handleElementPosition(ele: Element): void {
    if (ele) {
      const { x, y, width, height } = ele.getBoundingClientRect();
      const _p: DOMRect = (document.querySelector('.pge-canvas') as HTMLDivElement).getBoundingClientRect();
      setSeat({
        width,
        height,
        x: x - _p.x,
        y: y - _p.y,
      });
    }
  }

  // todo: give a better name, maybe calcPosition
  function computedPlace(): void {
    if (!page.activeElemId) return;

    const elementInfo = page.schemaElements[page.activeElemId];
    handleElementPosition(elementInfo.element);
  }

  function getTransformX(): string {
    const { element } = page.schemaElements[page.activeElemId];
    if (element) {
      const { width } = element.getBoundingClientRect();
      const canvasWid = (document.querySelector('.pge-canvas') as Element).getBoundingClientRect().width;
      if (width === canvasWid) {
        return 'translateX(0)';
      }
      return 'translateX(100%)';
    }
    return 'translateX(0)';
  }

  // todo: remove
  function renderParents(): JSX.Element {
    function getParentList(): any[] {
      const parentIds = page.parentNodes;
      return parentIds.map((item) => {
        const element = page.findElement(item);
        return ({
          value: item,
          // label: `容器${index}`,
          label: (element && element.label) || '容器',
        });
      });
    }

    return (
      <Popper
        ref={popperRef}
        reference={reference}
        trigger='hover'
      >
        <ul>
          {
            getParentList().map((item) => {
              return (
                <li className='mb-2' key={item.value} onClick={() => page.setActiveElemId(item.value)}>
                  <div
                    className='px-4 flex items-center rounded-2 cursor-pointer' // bg-gray-400
                    style={{ backgroundColor: '#94A3B8', borderRadius: 2 }}
                  >
                    <Icon name='insert_drive_file' color='white' className='mr-4' clickable />
                    <span className='text-12 text-white whitespace-nowrap'>{item.label}</span>
                  </div>
                </li>
              );
            })
          }
        </ul>
      </Popper>
    );
  }

  const { width, height, x, y } = seat;

  return (
    <div
      className='absolute top-0 left-0 bottom-0 right-0 overflow-visible z-10 inline-block'
      style={{ transform: 'translate(0px 0px)', pointerEvents: 'none' }}
    >
      {
        page.activeElemId && (
          <>
            <div style={{
              width,
              height,
              border: '1px solid #197aff',
              transform: `translate3d(${x}px, ${y}px, 0px)`,
              zIndex: 10,
              pointerEvents: 'none',
              willChange: 'width, height, transform',
            }}>
              <div
                className='h-20 border border-black flex absolute z-10'
                style={{ bottom: '-22px', right: '0', pointerEvents: 'all', transform: getTransformX() }}
              >
                <div
                  // bg-gradient-to-r from-blue-500 to-blue-600
                  className='mr-4 px-4 flex items-center rounded-2 cursor-pointer'
                  style={{ backgroundColor: '#006cff', borderRadius: 2 }}
                  ref={reference}
                >
                  <Icon name='insert_drive_file' color='white' className='mr-4' clickable />
                  <span className='text-12 text-white whitespace-nowrap'>
                    {page.activeElem?.label}
                  </span>
                </div>
                <div className='px-4 flex items-center justify-around corner-0-0-4-4 bg-white'>
                  <Icon
                    name='content_copy'
                    size={14}
                    className='mr-4'
                    clickable
                    onClick={() => {
                      page.copyNode(page.activeElemId);
                    }}
                  />
                  <Icon name='delete' clickable onClick={() => page.removeNode(page.activeElemId)}
                  />
                </div>
              </div>
            </div>
            {renderParents()}
          </>
        )
      }
    </div>
  );
}

export default observer(React.forwardRef(NodeToolbox));
