import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import type { Artery, Node } from '@one-for-all/artery';
import cs from 'classnames';
import { noop } from 'rxjs';

import Messenger from './lib/messenger';
import Fence from './lib/fence';
import { NodePrimary } from './types';
import { useSyncResponders, useSyncArtery, useSyncActiveNode, useSyncActiveModalLayer } from './sync-hooks';
import { MESSAGE_TYPE_ARTERY } from './simulator/constants';
import buildHeadElements from './build-head-elements';

import './index.scss';

export interface Props {
  artery: Artery;
  setActiveNode: (node?: Node) => void;
  onChange: (artery: Artery) => void;
  activeNode?: Node;
  // modal layer root node id
  activeOverLayerNodeID?: string;
  setActiveOverLayerNodeID: (activeOverLayerNodeID?: string) => void;

  // todo plugin url
  pluginsSrc: string;
  // todo a better design
  cssURLs?: Array<string>;
  className?: string;
  isNodeSupportChildren: (node: NodePrimary) => Promise<boolean>;
  overLayerComponents: Array<{ packageName: string; exportName: string }>;
}

export interface SimulatorRef {
  iframe: HTMLIFrameElement | null;
}

function Simulator(
  {
    activeOverLayerNodeID,
    activeNode,
    artery,
    className,
    cssURLs,
    isNodeSupportChildren,
    onChange,
    pluginsSrc,
    setActiveOverLayerNodeID,
    setActiveNode,
    overLayerComponents,
  }: Props,
  simulatorRef: React.ForwardedRef<SimulatorRef>,
): JSX.Element {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [messenger, setMessenger] = useState<Messenger>();
  const [iframeLoad, setIframeLoad] = useState(false);

  useImperativeHandle(simulatorRef, () => {
    return { iframe: iframeRef.current || null };
  });

  useEffect(() => {
    if (!iframeRef.current?.contentWindow || !iframeLoad) {
      return;
    }

    const msgr = new Messenger(iframeRef.current?.contentWindow, 'host-side');
    msgr
      .waitForReady()
      .then(() => {
        msgr.send(MESSAGE_TYPE_ARTERY, artery);
      })
      .catch(noop);

    setMessenger(msgr);

    // TODO fixme
    iframeRef.current.contentWindow.__OVER_LAYER_COMPONENTS = overLayerComponents;
  }, [iframeLoad]);

  useSyncResponders(messenger, isNodeSupportChildren);
  useSyncArtery(messenger, onChange, artery);
  useSyncActiveNode(messenger, setActiveNode, activeNode);
  useSyncActiveModalLayer(messenger, setActiveOverLayerNodeID, activeOverLayerNodeID);

  return (
    <div className={cs('artery-simulator', className)}>
      <Fence
        ref={iframeRef}
        headElements={buildHeadElements(pluginsSrc, cssURLs)}
        onLoad={() => setIframeLoad(true)}
      />
    </div>
  );
}

export default React.forwardRef<SimulatorRef, Props>(Simulator);
