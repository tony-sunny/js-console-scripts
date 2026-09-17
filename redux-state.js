const getReduxState = () => {
  const CONTAINER_PREFIX = "__reactContainer$";

  const isStore = (s) =>
    !!s &&
    typeof s.getState === "function" &&
    typeof s.dispatch === "function" &&
    typeof s.subscribe === "function";

  // Immutable.js state -> plain JS; plain objects pass through
  const toPlain = (s) => (typeof s?.toJS === "function" ? s.toJS() : s);

  // Collect this document plus all reachable same-origin iframe documents
  const collectDocuments = (doc, docs = []) => {
    docs.push(doc);
    for (const frame of doc.querySelectorAll("iframe, frame")) {
      let childDoc = null;
      try {
        childDoc = frame.contentDocument; // null for cross-origin
      } catch {
        // some browsers throw instead of returning null
      }
      if (childDoc) {
        collectDocuments(childDoc, docs);
      } else {
        console.info("Skipping cross-origin frame:", frame.src || frame);
      }
    }
    return docs;
  };

  const stores = new Map(); // store -> frame URL (Map also dedupes)
  let rootCount = 0;

  for (const doc of collectDocuments(document)) {
    // doc itself covers apps that hydrate the whole page (Next.js App Router, Remix)
    for (const node of [doc, ...doc.querySelectorAll("*")]) {
      const key = Object.keys(node).find((k) => k.startsWith(CONTAINER_PREFIX));
      // value is null after root.unmount(), hence the optional chaining
      const rootFiber = key && node[key]?.stateNode?.current;
      if (!rootFiber) continue;
      rootCount++;

      const stack = [rootFiber];
      while (stack.length) {
        const fiber = stack.pop();
        const props = fiber.memoizedProps;
        // <Provider store={...}> or the ReactReduxContext.Provider value it renders
        for (const candidate of [props?.store, props?.value?.store]) {
          if (isStore(candidate) && !stores.has(candidate)) {
            stores.set(candidate, doc.location.href);
          }
        }
        if (fiber.sibling) stack.push(fiber.sibling);
        if (fiber.child) stack.push(fiber.child);
      }
    }
  }

  if (rootCount === 0) {
    console.warn("React root not found");
    return;
  }
  if (stores.size === 0) {
    console.warn("Redux store not found");
    return;
  }

  return Object.fromEntries(
    [...stores].map(([s, href], i) => [
      `Store${i + 1}${href === location.href ? "" : ` (${href})`}`,
      toPlain(s.getState()),
    ]),
  );
};

getReduxState();
