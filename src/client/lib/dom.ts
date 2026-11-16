export function appendNodes(parent: Node, ...children: Array<Node | null | undefined>): void {
  for (const child of children) {
    if (child) {
      parent.appendChild(child);
    }
  }
}
