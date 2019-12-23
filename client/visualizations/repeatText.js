 const repeatText = (ctx, textContent='text', fillOrStroke = 'fill',x=0,y=0, horizontalTranslate=10, verticalTranslate=10, repetitions=1, maxWidth=null) => {

        for(let i =0;i<repetitions;i++){
            if(fillOrStroke === 'fill'){
                ctx.fillText(textContent,x+i*horizontalTranslate,y+i*verticalTranslate, maxWidth ? maxWidth : null );

            }else{
                ctx.strokeText(textContent,x+i*horizontalTranslate,y+i*verticalTranslate, maxWidth ? maxWidth : null );
            }
        }
    }
export default repeatText;
