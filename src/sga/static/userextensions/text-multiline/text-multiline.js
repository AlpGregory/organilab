const name = 'text'
const loadExtensionTranslation = async function (svgEditor) {
  let translationModule
  const lang = svgEditor.configObj.pref('lang')
  try {
    translationModule = await import(`./locale/${lang}.js`)
  } catch (_error) {
    console.warn(`Missing translation (${lang}) for ${name} - using 'en'`)
    translationModule = await import('./locale/en.js')
  }
  svgEditor.i18next.addResourceBundle(lang, name, translationModule.default)
}

export default {
  name,
  async init () {
    const svgEditor = this
    await loadExtensionTranslation(svgEditor)
    const { svgCanvas } = svgEditor
    const { $id, $click } = svgCanvas
    const modeId = 'tool_textcodes'
    const plugId = 'ext-text'
    const registerTextEvent= ()=>{
        document.body.addEventListener('click',(e)=>{
              if (e.target.classList.contains('text_content')) {
                let content=e.target.textContent;
                let letter=content.split(" ");
                let count_letter= letter.length;
                let spaces=0;
                let index=0;
                let y=50;
                let word=""
                let list_id= []
                while(count_letter>0){
                    word += letter[index]+" ";
                    if(spaces==4 || letter.length-1==index){
                        addTextToDom(word,y);
                        y+=10;
                        spaces=0;
                        word=""
                        list_id.push(svgCanvas.getNextId())
                     }
                    spaces+=1;
                    index+=1
                    count_letter-=1
                }
        /*        let curShape= svgCanvas.createSVGElement({
                                                element: 'g',
                                                attr: { id:('selectorGroup'+svgCanvas.getNextId()) }
                                              })
        console.log(svgCanvas.getElement(list_id[0]))
        canv.setSelectedElements(0, curShape)
        canv.uniquifyElems(curShape)

		canv.setCurrentMode('select')
        svgEditor.leftPanel.updateLeftPanel('tool_select')
        */
         list_id = []
              }
        })
    }

    const addTextToDom= (content,y)=>{
        const textclass="text"
        const curStyle = svgCanvas.getStyle()
        const curShape = svgCanvas.addSVGElementsFromJson({
              element: 'text',
              curStyles: true,
              attr: { x:100, y:y,  height: 100,  width: 100,
                      class: textclass,
                      id: svgCanvas.getNextId(),
                      opacity: curStyle.opacity,
                      fill: svgCanvas.getCurText('fill'),
                     'stroke-width': svgCanvas.getCurText('stroke_width')

                    }
            })
        curShape.textContent=content
        svgCanvas.setSelectedElements(0, curShape)
    }

    return {
           name: svgEditor.i18next.t(`${name}:name`),
       callback () {
        registerTextEvent()
      },
    }
   }
 }


