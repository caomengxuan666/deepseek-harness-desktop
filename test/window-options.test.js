import assert from 'node:assert/strict'
import test from 'node:test'
import { createWindowOptions } from '../src/window-options.js'

test('all platforms use the frameless window shell', () => {
  assert.equal(createWindowOptions('darwin').frame, false)
  assert.equal(createWindowOptions('darwin').titleBarOverlay.height, 36)
})

test('Windows keeps the menu bar hidden', () => {
  assert.equal(createWindowOptions('win32').autoHideMenuBar, true)
  assert.equal(createWindowOptions('win32').titleBarOverlay.symbolColor, '#34434d')
})
