const repeatedText = (ctx, textContent='text', fillOrStroke = 'fill',x=0,y=0, spacing=10, repetitions=1) => {
    // draw the text ${repetitions} times, with ${spacing} spacing
    for(let i =0;i<repetitions;i++){
        if(fillOrStroke = 'fill'){
            ctx.fillText(textContent,x,y+spacing, maxWidth ? maxWidth : null );

        }else{
            ctx.strokeText(textContent,x,y+spacing, maxWidth ? maxWidth : null );
        }
    }
}
export default repeatedText;
