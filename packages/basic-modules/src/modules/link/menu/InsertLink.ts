/**
 * @description insert link menu
 * @author wangfupeng
 */

import { Editor, Range, Node } from 'slate'
import { IModalMenu, IDomEditor, genModalButtonElems, t } from '@wangeditor/core'
import $, { Dom7Array, DOMElement } from '../../../utils/dom'
import { genRandomStr } from '../../../utils/util'
import { isMenuDisabled, insertLink } from '../helper'

/**
 * 生成唯一的 DOM ID
 */
function genDomID(): string {
  return genRandomStr('w-e-insert-link')
}

/**
 * 生成 modal input elems
 * @param labelText label text
 * @param inputId input dom id
 * @param placeholder input placeholder
 * @returns [$container, $input]
 */
function genModalInputElems(
  labelText: string,
  inputId: string,
  placeholder?: string
): DOMElement[] {
  const $container = $('<label class="babel-container"></label>')
  $container.append(`<span style="display: inline-block;">${labelText}</span>`)
  const $input = $(
    `<input type="text" style="width: auto;" id="${inputId}" placeholder="${placeholder || ''}">`
  )
  $container.append($input)

  return [$container[0], $input[0]]
}

function genUsuallyTagElems(list: string[], clickFn: Function): DOMElement[] {
  const $tagContainer = $('<div class="usually-tag-container babel-container"></div>')
  $tagContainer.append('<span style="display: inline-block;">常用：</span>')
  list.forEach(val => {
    const $tag = $(`<span class="usually-tag" name=${val}>${val}</span>`)
    $tag.on('click', () => {
      console.log(val)
      clickFn(val)
    })
    $tagContainer.append($tag)
  })
  return [$tagContainer[0]]
}

class InsertLinkMenu implements IModalMenu {
  readonly title = '动态数据源'
  readonly iconSvg = '<img src="/static/wangEditor-dynamic-icon.png" width="20">'
  readonly tag = 'button'
  readonly showModal = true // 点击 button 时显示 modal
  readonly modalWidth = 300
  private $content: Dom7Array | null = null
  private readonly textInputId = genDomID()
  private readonly buttonId = genDomID()

  getValue(editor: IDomEditor): string | boolean {
    // 插入菜单，不需要 value
    return ''
  }

  isActive(editor: IDomEditor): boolean {
    // 任何时候，都不用激活 menu
    return false
  }

  exec(editor: IDomEditor, value: string | boolean) {
    // 点击菜单时，弹出 modal 之前，不需要执行其他代码
    // 此处空着即可
  }

  isDisabled(editor: IDomEditor): boolean {
    return isMenuDisabled(editor)
  }

  getModalPositionNode(editor: IDomEditor): Node | null {
    return null // modal 依据选区定位
  }

  getModalContentElem(editor: IDomEditor): DOMElement {
    const { selection } = editor
    const { textInputId, buttonId } = this

    // 获取 input button elem
    const [textContainerElem, inputTextElem] = genModalInputElems('自定义：', textInputId)
    const $inputText = $(inputTextElem)
    const [buttonContainerElem, buttonElem] = genModalButtonElems(buttonId, t('common.ok'))

    // 常用字段
    const [tagContainerElem] = genUsuallyTagElems(['班级', '学生姓名', '奖项'], (value: string) => {
      insertLink(editor, value, 'javascript:void(0);')
      editor.hidePanelOrModal() // 隐藏 modal
    })

    if (this.$content == null) {
      // 第一次渲染
      const $content = $('<div class="uni-dynamic-modal"></div>')

      // 绑定事件（第一次渲染时绑定，不要重复绑定）
      $content.on('click', `#${buttonId}`, e => {
        e.preventDefault()
        const text = $content.find(`#${textInputId}`).val()
        if (text) {
          insertLink(editor, text, 'javascript:void(0);') // 插入链接
          editor.hidePanelOrModal() // 隐藏 modal
        }
      })

      // 记录属性，重要
      this.$content = $content
    }

    const $content = this.$content
    $content.empty() // 先清空内容

    // append inputs and button
    $content.append('<p style="font-weight:bold;margin-bottom: 14px;">动态数据源</p>')
    $content.append(tagContainerElem)
    $content.append(textContainerElem)
    $content.append(buttonContainerElem)

    // 设置 input val
    if (selection == null || Range.isCollapsed(selection)) {
      // 选区无内容
      $inputText.val('')
    } else {
      // 选区有内容
      const selectionText = Editor.string(editor, selection)
      $inputText.val(selectionText)
    }

    // focus 一个 input（异步，此时 DOM 尚未渲染）
    setTimeout(() => {
      $inputText.focus()
    })

    return $content[0]
  }
}

export default InsertLinkMenu
