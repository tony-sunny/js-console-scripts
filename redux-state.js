const getReduxState = () => {
  let reactRoots = Array.from(document.querySelectorAll("*")).filter((el) =>
    Object.keys(el).find((key) => key.startsWith("__reactContainer")),
  );
  if (reactRoots.length === 0) {
    console.warn("React root not found");
    return;
  }
  const reduxStores = reactRoots.reduce((stores, root) => {
    const reactContainerKey = Object.keys(root).find((key) =>
      key.startsWith("__reactContainer"),
    );
    const reactContainer = root[reactContainerKey];
    let props = reactContainer?.stateNode?.current?.child?.pendingProps;
    let reduxStore;
    let counter = 0;
    while (props) {
      counter++;
      reduxStore = props?.store;
      if (typeof reduxStore?.getState === "function") {
        break;
      }
      props = props?.children?.props;
    }
    if (reduxStore) {
      stores.push(reduxStore);
    }
    return stores;
  }, []);
  if (reduxStores.length === 0) {
    console.warn("Redux store not found");
    return;
  }
  return Object.fromEntries(
    reduxStores.map((s, idx) => [`Store${idx + 1}`, s.getState()]),
  );
};

getReduxState();
