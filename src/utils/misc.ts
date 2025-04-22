function isNodejs() {
  return (
    typeof "process" !== "undefined" &&
    process &&
    process.versions &&
    process.versions.node
  );
}
