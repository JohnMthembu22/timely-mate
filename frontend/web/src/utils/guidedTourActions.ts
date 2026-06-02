export type TourNavHandlers = {
  onNext: () => void;
  onPrev: () => void;
};

let handlers: TourNavHandlers | null = null;

export function setTourNavHandlers(next: TourNavHandlers | null): void {
  handlers = next;
}

export function invokeTourNext(): void {
  handlers?.onNext();
}

export function invokeTourPrev(): void {
  handlers?.onPrev();
}
