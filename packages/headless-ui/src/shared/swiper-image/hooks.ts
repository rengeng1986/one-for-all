import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

type useNextReturn = {
  newImages: Array<string>;
  current: number;
  setCurrent: Dispatch<SetStateAction<number>>;
  setNext: () => void;
  clearTimer: () => void;
};

function removeDuplicate(arr: Array<string>): Array<string> {
  const obj: Record<string, boolean> = {};
  return arr.reduce(function (newArr: Array<string>, next: string) {
    if (!(next in obj)) {
      obj[next] = true;
      newArr.push(next);
    }
    return newArr;
  }, []);
}

function useNext(
  images: Array<string>,
  defaultIndex: number,
  disableAutoplay: boolean,
  autoplaySpeed: number,
  onChange?: (index: number) => void,
): useNextReturn {
  const [newImages, setNewImages] = useState(removeDuplicate(images));
  const [current, setCurrent] = useState(defaultIndex < newImages.length && defaultIndex > -1 ? defaultIndex : 0);
  const timer: any = useRef(null);

  useEffect(() => {
    if (current > newImages.length - 1) {
      setCurrent(0);
    }

    if (newImages.length > 1 && !disableAutoplay) {
      setNext();
    }

    return () => clearTimer();
  }, [newImages, disableAutoplay, autoplaySpeed]);

  useEffect(() => {
    setNewImages(removeDuplicate(images));
  }, [images]);

  function setNext() {
    const nextInterval = setInterval(() => {
      setCurrent((val) => {
        let nextStep = val + 1;
        if (nextStep === newImages.length) {
          nextStep = 0;
        }
        onChange?.(nextStep);
        return nextStep;
      });
    }, autoplaySpeed);
    timer.current = nextInterval;
  }

  function clearTimer() {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }

  return {
    newImages,
    current,
    setCurrent,
    setNext,
    clearTimer,
  };
}

export default useNext;
