function info(msg){
    console.log("MESSAGE",msg)
    let panel;
    if(msg.type === "error"){
        panel = '<div class="info_panel info_panel_error">' + msg.value + '</div>'
    }
    else if(msg.type === "info") {
        panel = '<div class="info_panel info_panel_info">' + msg.value + '</div>'
    }
    else if(msg.type === "success"){
        panel = '<div class="info_panel info_panel_success">' + msg.value + '</div>'

    }
    else{
        panel = '<div class="info">' + msg.value + '</div>'
    }
    panel = $(panel)
    console.log(panel)
    panel.prependTo($('#info')).hide().slideDown().animate({"margin-left": '+=500'},function(){
        let self = this;

        window.setTimeout(function(){

            $(self).animate({"margin-left": '-=500'},400,"swing",function(){
                $(self).remove()
            })
        },5000)

    });

}
