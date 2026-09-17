const getReduxState = () => {
  const isStore = (s) =>
    !!s &&
    typeof s.getState === "function" &&
    typeof s.dispatch === "function" &&
    typeof s.subscribe === "function";

  const stores = new Set();

  for (const el of document.querySelectorAll("*")) {
    const key = Object.keys(el).find((k) => k.startsWith("__reactContainer$"));
    if (!key) continue;

    // stateNode is the FiberRoot; .current is the committed HostRoot fiber
    const rootFiber = el[key]?.stateNode?.current;
    const stack = rootFiber ? [rootFiber] : [];

    while (stack.length) {
      const fiber = stack.pop();
      const props = fiber.memoizedProps;
      // <Provider store={...}> or the ReactReduxContext.Provider value it renders
      for (const candidate of [props?.store, props?.value?.store]) {
        if (isStore(candidate)) stores.add(candidate);
      }
      if (fiber.sibling) stack.push(fiber.sibling);
      if (fiber.child) stack.push(fiber.child);
    }
  }

  if (stores.size === 0) {
    console.warn("Redux store not found");
    return;
  }

  return Object.fromEntries(
    [...stores].map((s, i) => [`Store${i + 1}`, s.getState()]),
  );
};

getReduxState();
