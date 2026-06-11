import React, { useState } from "react";
import { TabsContext, useTabsContext } from "./tabs-context";

export function Tabs({ defaultValue, children }) {
  const [value, setValue] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      {children}
    </TabsContext.Provider>
  );
}

export function TabsList({ children }) {
  return <div className="inline-flex gap-2">{children}</div>;
}

export function TabsTrigger({ value, children }) {
  const { value: activeValue, setValue } = useTabsContext();
  const isActive = value === activeValue;

  return (
    <button
      className={`px-4 py-2 text-sm rounded ${
        isActive
          ? "bg-blue-500 text-white"
          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
      }`}
      onClick={() => setValue(value)}
      id={`tab-${value}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children }) {
  const { value: activeValue } = useTabsContext();
  const isActive = value === activeValue;

  return isActive ? (
    <div role="tabpanel" aria-labelledby={`tab-${value}`} className="mt-4">
      {children}
    </div>
  ) : null;
}
