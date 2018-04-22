export interface State {
  query: string;
  result: any[];
}

export const initial: State = {
  query: '',
  result: []
};
