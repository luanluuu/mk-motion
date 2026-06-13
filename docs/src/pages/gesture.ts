import {
  Draggable,
  TapRecognizer,
  SwipeRecognizer,
  PinchRecognizer,
  spring,
  elasticScale,
} from 'mk-motion'

export function renderGesture(container?: HTMLElement) {
  document.getElementById('toc')!.style.display = 'none'
  const main = container || document.getElementById('main')!
  main.innerHTML = `
    <h1 class="doc-h1">手势交互</h1>
    <p class="doc-p">MotionKit 提供一套轻量级手势识别器，支持拖拽、滑动、捏合、点击/长按/双击，以及基于弹簧物理的弹性反馈。</p>

    <h2 class="doc-h2">🖐 拖拽（Draggable）</h2>
    <p class="doc-p"><code class="doc-code-inline">Draggable</code> 基于 Pointer Events，支持轴向限制与边界约束。</p>
    <div class="doc-demo">
      <div class="doc-demo-stage" style="justify-content:center;min-height:160px;">
        <div id="draggable-box" style="width:100px;height:100px;background:linear-gradient(135deg,var(--mk-primary),var(--mk-indigo-500));border-radius:16px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;cursor:grab;touch-action:none;user-select:none;">拖拽我</div>
      </div>
    </div>

    <h2 class="doc-h2">👆 点击识别（TapRecognizer）</h2>
    <p class="doc-p">支持单击、双击与长按。双击会抑制第二次单击回调。</p>
    <div class="doc-demo">
      <div class="doc-demo-stage" style="flex-direction:column;align-items:center;gap:16px;min-height:160px;">
        <div id="tap-box" style="padding:16px 32px;background:var(--mk-success);color:#fff;border-radius:12px;cursor:pointer;font-weight:600;user-select:none;">点击 / 双击 / 长按</div>
        <div id="tap-log" style="font-family:monospace;font-size:0.85rem;color:var(--mk-text-secondary);">等待手势...</div>
      </div>
    </div>

    <h2 class="doc-h2">↔️ 滑动识别（SwipeRecognizer）</h2>
    <p class="doc-p">检测水平或垂直快速滑动手势，并返回方向与速度。</p>
    <div class="doc-demo">
      <div class="doc-demo-stage" style="flex-direction:column;align-items:center;gap:16px;min-height:160px;">
        <div id="swipe-box" style="width:240px;height:120px;background:var(--mk-warning);border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;cursor:pointer;user-select:none;">在此区域滑动</div>
        <div id="swipe-log" style="font-family:monospace;font-size:0.85rem;color:var(--mk-text-secondary);">等待滑动...</div>
      </div>
    </div>

    <h2 class="doc-h2">🤏 捏合识别（PinchRecognizer）</h2>
    <p class="doc-p">双指捏合缩放，常用于图片查看器。</p>
    <div class="doc-demo">
      <div class="doc-demo-stage" style="justify-content:center;min-height:180px;">
        <div id="pinch-box" style="width:160px;height:160px;background:linear-gradient(135deg,var(--mk-danger),#f59e0b);border-radius:16px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;text-align:center;line-height:1.5;">双指捏合<br>缩放我</div>
      </div>
    </div>

    <h2 class="doc-h2">🌀 弹簧反馈</h2>
    <p class="doc-p"><code class="doc-code-inline">spring</code> 与 <code class="doc-code-inline">elasticScale</code> 可为手势结束后的元素提供自然回弹。</p>
    <div class="doc-demo">
      <div class="doc-demo-stage" style="justify-content:center;min-height:140px;">
        <div id="elastic-box" style="width:100px;height:100px;background:linear-gradient(135deg,var(--mk-info),var(--mk-primary));border-radius:16px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;cursor:pointer;user-select:none;">点击弹一下</div>
      </div>
    </div>

    <h2 class="doc-h2">代码示例</h2>
    <pre class="doc-code-block"><code>import { Draggable, TapRecognizer, SwipeRecognizer, PinchRecognizer, elasticScale } from 'mk-motion'

// 拖拽
const draggable = new Draggable('#box', {
  axis: 'both',
  onDrag: (x, y) => console.log(x, y),
})

// 点击/长按/双击
const tap = new TapRecognizer('#btn', {
  onTap: () => {},
  onDoubleTap: () => {},
  onLongPress: () => {},
})

// 滑动
const swipe = new SwipeRecognizer('#area', {
  onSwipe: (dir) => console.log(dir),
})

// 捏合
const pinch = new PinchRecognizer('#img', {
  onPinch: (scale) => console.log(scale),
})

// 弹性缩放
elasticScale('#box', 1.2)
</code></pre>
  `

  setTimeout(() => {
    const draggable = new Draggable(document.getElementById('draggable-box')!, {
      axis: 'both',
    })

    const tapLog = document.getElementById('tap-log')!
    const tap = new TapRecognizer(document.getElementById('tap-box')!, {
      onTap: () => {
        tapLog.textContent = '单击'
      },
      onDoubleTap: () => {
        tapLog.textContent = '双击'
      },
      onLongPress: () => {
        tapLog.textContent = '长按'
      },
    })

    const swipeLog = document.getElementById('swipe-log')!
    const swipe = new SwipeRecognizer(document.getElementById('swipe-box')!, {
      onSwipe: (dir) => {
        swipeLog.textContent = `方向: ${dir}`
      },
    })

    let pinchScale = 1
    const pinchBox = document.getElementById('pinch-box')!
    const pinch = new PinchRecognizer(pinchBox, {
      onPinch: (scale) => {
        pinchScale = scale
        pinchBox.style.transform = `scale(${pinchScale})`
      },
      onPinchEnd: () => {
        pinchScale = 1
        pinchBox.style.transform = 'scale(1)'
      },
    })

    const elasticBox = document.getElementById('elastic-box')!
    elasticBox.addEventListener('click', () => {
      const stop = elasticScale(elasticBox, 1.3, {
        stiffness: 300,
        damping: 18,
      })
      setTimeout(() => {
        stop()
        elasticScale(elasticBox, 1, { stiffness: 300, damping: 18 })
      }, 200)
    })
  }, 0)
}
