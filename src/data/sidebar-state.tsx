import { Accessor, createContext, createSignal, ParentComponent, Setter, useContext } from "solid-js";

type SidebarState = {
  isExpanded: Accessor<boolean>;
  setIsExpanded: Setter<boolean>;
}

export const SidebarStateContext = createContext<SidebarState>();
export const useSidebarState = () => useContext(SidebarStateContext)!;

export const SidebarStateProvider: ParentComponent = (props) => {
  const [isExpanded, setIsExpanded] = createSignal(false);

  return (
    <SidebarStateContext.Provider value={{ isExpanded, setIsExpanded }}>
      {props.children}
    </SidebarStateContext.Provider>
  )
}
