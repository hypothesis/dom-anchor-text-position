import createNodeIterator from 'dom-node-iterator'

import rangeToString from './range-to-string'

const SHOW_TEXT = 4

export function fromRange(root, range) {
  if (root === undefined) {
    throw new Error('missing required parameter "root"')
  }
  if (range === undefined) {
    throw new Error('missing required parameter "range"')
  }

  let document = root.ownerDocument
  let prefix = document.createRange()

  let startNode = range.startContainer
  let startOffset = range.startOffset

  prefix.setStart(root, 0)
  prefix.setEnd(startNode, startOffset)

  let start = rangeToString(prefix).length
  let end = start + rangeToString(range).length

  return {
    start: start,
    end: end,
  }
}


export function toRange(root, selector = {}) {
  if (root === undefined) {
    throw new Error('missing required parameter "root"')
  }

  let start = selector.start || 0
  let end = selector.end || start

  // Total character length of text nodes visited so far.
  let nodeTextOffset = 0

  // Node and character offset where the start position of the selector occurs.
  let startContainer = null
  let startOffset = 0

  // Node and character offset where the end position of the selector occurs.
  let endContainer = null
  let endOffset = 0

  // Iterate over text nodes and find where the start and end positions occur.
  let iter = createNodeIterator(root, SHOW_TEXT)
  while (iter.nextNode()) {
    let nodeTextLength = iter.referenceNode.nodeValue.length

    if (startContainer === null &&
        start >= nodeTextOffset && start <= nodeTextOffset + nodeTextLength) {
      startContainer = iter.referenceNode
      startOffset = start - nodeTextOffset
    }
    if (endContainer === null &&
        end >= nodeTextOffset && end <= nodeTextOffset + nodeTextLength) {
      endContainer = iter.referenceNode
      endOffset = end - nodeTextOffset
    }

    nodeTextOffset += nodeTextLength
  }

  if (!startContainer) {
    throw new Error('Start offset of position selector is out of range')
  }
  if (!endContainer) {
    throw new Error('End offset of position selector is out of range')
  }

  let range = root.ownerDocument.createRange()
  range.setStart(startContainer, startOffset)
  range.setEnd(endContainer, endOffset)

  return range
}
