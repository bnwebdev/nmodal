let nulp = ()=>{}
function getModalBase(options){
    let $modal = document.createElement('div')
    $modal.classList.add('nmodal-wrapper')
    $modal.innerHTML = 
`<div class='nmodal-overlayer'>
    <div class='nmodal'>
        <div class='nmodal-header'>
            <div class='nmodal-title'>
                ${options.title || 'Modal'}
            </div>
        </div>
        <div class='nmodal-body'>
            ${options.html || ''}
        </div>
        <div class='nmodal-footer'>
        </div>
    </div>
</div>`
    return $modal
}

function createModal(options = {}){
  const is = {
    opening: false,
    closing: false,
    opened: false,
    destroyed: false,
  }
  let modal = {
    open,
    close,
    destroy,
    target
  }
  const $modal = getModalBase(options)
  function target(){
    return $modal
  }
    let $butts = []
    function createButton(butt){
        const $butt = document.createElement('div')
        $butt.innerHTML = butt.html
        if(butt.id) $butt.id = butt.id
        $butt.classList.add('nmodal-button')
        if(butt.class) $butt.classList.add(butt.class);
        const handler = e=>{
            const h = butt.handler || nulp
            h(modal, e)
        }
        $butt.addEventListener('click', handler)
        $butts.push({$butt, handler: handler})
        return $butt
    }
    const $footer = $modal.querySelector('.nmodal-footer')
    if(options.buttons) options.buttons.map(createButton).forEach($butt=>$footer.append($butt))
    
  
  let onOpen = options.onOpen || nulp
  let onClose = options.onClose || nulp
  let onClosed = options.onClosed || nulp
  let onOpened = options.onOpened || nulp
  
  function handler(e){
    if(e.target.classList.contains('nmodal-close-button') ||
       e.target.classList.contains('nmodal-overlayer'))
    {
      modal.close()  
    }
  }
  $modal.addEventListener('click', handler, true)
  if(options.isClosable){
    let $head = $modal.querySelector('.nmodal-header')
    let $butt = createButton({html: 'X', "class": 'nmodal-close-button', handler: m=>m.close()})
    $head.append($butt)
  }
  
  function open(){
    if(is.opening || is.destroyed || is.closing || is.opened) return
    is.opening = true
    $modal.classList.add('open')
    onOpen(modal)
    setTimeout(()=>{
       is.opening = false
       is.opened = true
       onOpened(modal)
    }, options.timeOpening || 300)
  }
  function close(){
    if(is.opening || is.destroyed || is.closing || !is.opened) return
    is.opened = false
    is.closing = true
    $modal.classList.remove('open')
    $modal.classList.add('hide')
    onClose(modal)
    setTimeout(()=>{
       is.closing = false
       $modal.classList.remove('hide')
       onClosed(modal)
    }, options.timeOpening || 300)
  }
  function destroy(){
    $butts.forEach(({$butt, handler})=>{
      $butt.removeEventListener('click', handler)  
    })
    $modal.removeEventListener('click', handler, true)
    $modal.remove()
    is.destroyed = true
  }
  document.body.append($modal)
  
  return modal  
}

function nprompt(question, placeholder){
  return new Promise((req, rej)=>{
    const modal = createModal({
      title: question,
      html: `<input type="text" placeholder="${placeholder || ''}">`,
      onClosed: m=>{
        m.destroy()
        rej()
      },
      buttons: [
        {
          html: 'Ok',
          handler: (m, e)=>{
            m.close()
            req(modal.target().querySelector('input').value)
          }
        },
        {
          html: 'Cancel',
          handler: (m, e)=>{
            m.close()
            rej()
          }
        }
      ]
    })
    modal.open()
  })
}
