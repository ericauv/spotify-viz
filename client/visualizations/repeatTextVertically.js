 const repeatTextVertically = (ctx, textContent='text', fillOrStroke = 'fill',x=0,y=0, spacing=10, invertDirection=false, repetitions=1, maxWidth=null) => {
        // draw the text ${repetitions} times, with ${spacing} spacing
        if(invertDirection){
            spacing=-spacing;
        }
        for(let i =0;i<repetitions;i++){
            if(fillOrStroke === 'fill'){
                ctx.fillText(textContent,x,y+spacing*i, maxWidth ? maxWidth : null );

            }else{
                ctx.strokeText(textContent,x,y+spacing*i, maxWidth ? maxWidth : null );
            }
        }
    }
export default repeatTextVertically;
