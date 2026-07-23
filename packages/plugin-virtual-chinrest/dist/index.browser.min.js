var jsPsychVirtualChinrest=function(r){"use strict";var P="3.1.0";const M={name:"virtual-chinrest",version:P,parameters:{resize_units:{type:r.ParameterType.SELECT,options:["none","cm","inch","deg"],default:"none"},pixels_per_unit:{type:r.ParameterType.INT,default:100},adjustment_prompt:{type:r.ParameterType.HTML_STRING,default:`
          <div style="text-align: left;">
          <p>Click and drag the lower right corner of the image until it is the same size as a credit card held up to the screen.</p>
          <p>You can use any card that is the same size as a credit card, like a membership card or driver's license.</p>
          <p>If you do not have access to a real card you can use a ruler to measure the image width to 3.37 inches or 85.6 mm.</p>
          </div>`},adjustment_button_prompt:{type:r.ParameterType.HTML_STRING,default:"Click here when the image is the correct size"},item_path:{type:r.ParameterType.IMAGE,default:null,preload:!1},item_height_mm:{type:r.ParameterType.FLOAT,default:53.98},item_width_mm:{type:r.ParameterType.FLOAT,default:85.6},item_init_size:{type:r.ParameterType.INT,default:250},blindspot_reps:{type:r.ParameterType.INT,default:5},blindspot_prompt:{type:r.ParameterType.HTML_STRING,pretty_name:"Blindspot prompt",default:`
          <p>Now we will quickly measure how far away you are sitting.</p>
          <div style="text-align: left">
            <ol>
              <li>Put your left hand on the <b>space bar</b>.</li>
              <li>Cover your right eye with your right hand.</li>
              <li>Using your left eye, focus on the black square. Keep your focus on the black square.</li>
              <li>The <span style="color: red; font-weight: bold;">red ball</span> will disappear as it moves from right to left. Press the space bar as soon as the ball disappears.</li>
            </ol>
          </div>
          <p>Press the space bar when you are ready to begin.</p>
          `},blindspot_measurements_prompt:{type:r.ParameterType.HTML_STRING,default:"Remaining measurements: "},viewing_distance_report:{type:r.ParameterType.HTML_STRING,default:"<p>Based on your responses, you are sitting about <span id='distance-estimate' style='font-weight: bold;'></span> from the screen.</p><p>Does that seem about right?</p>"},redo_measurement_button_label:{type:r.ParameterType.HTML_STRING,default:"No, that is not close. Try again."},blindspot_done_prompt:{type:r.ParameterType.HTML_STRING,default:"Yes"}},data:{rt:{type:r.ParameterType.INT},item_height_mm:{type:r.ParameterType.FLOAT},item_width_mm:{type:r.ParameterType.FLOAT},item_height_deg:{type:r.ParameterType.FLOAT},item_width_deg:{type:r.ParameterType.FLOAT},item_width_px:{type:r.ParameterType.FLOAT},px2deg:{type:r.ParameterType.INT},px2mm:{type:r.ParameterType.FLOAT},scale_factor:{type:r.ParameterType.FLOAT},win_width_deg:{type:r.ParameterType.FLOAT},win_height_deg:{type:r.ParameterType.FLOAT},view_dist_mm:{type:r.ParameterType.FLOAT}},citations:{apa:"de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",bibtex:'@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '}};class b{constructor(n){this.jsPsych=n,this.ball_size=30,this.ball=null,this.container=null,this.reps_remaining=0,this.ball_animation_frame_id=null}trial(n,i){if(!(i.blindspot_reps>0)&&(i.resize_units=="deg"||i.resize_units=="degrees")){console.error("Blindspot repetitions set to 0, so resizing to degrees of visual angle is not possible!");return}this.reps_remaining=i.blindspot_reps;let e={item_width_mm:i.item_width_mm,item_height_mm:i.item_height_mm},s={ball_pos:[],slider_clck:!1},d=i.item_width_mm/i.item_height_mm;const L=d<1?i.item_init_size:Math.round(i.item_init_size/d),g=d<1?Math.round(i.item_init_size*d):i.item_init_size,f=Math.round(g*.1);let S=`
        <div id="page-size">
          <div id="item" style="border: none; height: ${L}px; width: ${g}px; margin: 5px auto; background-color: #ddd; position: relative; ${i.item_path===null?"":`background-image: url(${i.item_path}); background-size: 100% auto; background-repeat: no-repeat;`}">
            <div id="jspsych-resize-handle" style="cursor: nwse-resize; background-color: none; width: ${f}px; height: ${f}px; border: 5px solid red; border-left: 0; border-top: 0; position: absolute; bottom: 0; right: 0;">
            </div>
          </div>
          ${i.adjustment_prompt}
          <button id="end_resize_phase" class="jspsych-btn">
            ${i.adjustment_button_prompt}
          </button>
        </div>
      `,z=`
        <div id="blind-spot">
          ${i.blindspot_prompt}
          <div id="svgDiv" style="height:100px; position:relative;"></div>
          <button class="btn btn-primary" id="proceed" style="display:none;"> +
            ${i.blindspot_done_prompt} +
          </button>
          ${i.blindspot_measurements_prompt} 
          <div id="click" style="display:inline; color: red"> ${i.blindspot_reps} </div>
        </div>`,k=`
        <div id="distance-report">
          <div id="info-h">
            ${i.viewing_distance_report}
          </div>
          <button id="redo_blindspot" class="jspsych-btn">${i.redo_measurement_button_label}</button>
          <button id="proceed" class="jspsych-btn">${i.blindspot_done_prompt}</button>
        </div>
      `;n.innerHTML='<div id="content" style="width: 900px; margin: 0 auto;"></div>';const $=performance.now();q();function q(){n.querySelector("#content").innerHTML=S;let t=!1,a,o,l,u;const p=n.querySelector("#item");function C(){t=!1}document.addEventListener("mouseup",C);function G(m){m.preventDefault(),t=!0,a=m.pageX,o=m.pageY,l=parseInt(p.style.width),u=parseInt(p.style.height)}n.querySelector("#jspsych-resize-handle").addEventListener("mousedown",G);function J(m){if(t){let c=m.pageX-a,y=m.pageY-o;Math.abs(c)>=Math.abs(y)?(p.style.width=Math.round(Math.max(20,l+c*2))+"px",p.style.height=Math.round(Math.max(20,l+c*2)/d)+"px"):(p.style.height=Math.round(Math.max(20,u+y*2))+"px",p.style.width=Math.round(d*Math.max(20,u+y*2))+"px")}}n.addEventListener("mousemove",J),n.querySelector("#end_resize_phase").addEventListener("click",I)}function I(){const t=document.querySelector("#item").getBoundingClientRect().width;e.item_width_px=Math.round(t);const a=N(t);e.px2mm=h(a,2),i.blindspot_reps>0?w():_()}const w=()=>{s={ball_pos:[],slider_clck:!1},n.querySelector("#content").innerHTML=z,this.container=n.querySelector("#svgDiv"),F(),v()},v=()=>{const t=(this.container.getBoundingClientRect().width-this.ball_size)*.85;this.ball.style.left=`${t}px`,this.jsPsych.pluginAPI.getKeyboardResponse({callback_function:A,valid_responses:[" "],rt_method:"performance",allow_held_key:!1,persist:!1})},A=()=>{this.jsPsych.pluginAPI.getKeyboardResponse({callback_function:H,valid_responses:[" "],rt_method:"performance",allow_held_key:!1,persist:!1}),this.ball_animation_frame_id=requestAnimationFrame(T)},R=()=>{const t=s.ball_pos.reduce((l,u)=>l+u,0),a=s.ball_pos.length;s.avg_ball_pos=h(t/a,2);const o=(s.square_pos-s.avg_ball_pos)/e.px2mm/Math.tan(B(13.5));e.view_dist_mm=h(o,2),i.viewing_distance_report=="none"?_():O()};function O(){n.querySelector("#content").innerHTML=k,n.querySelector("#distance-estimate").innerHTML=`
          ${Math.round(e.view_dist_mm/10)} cm (${Math.round(e.view_dist_mm*.0393701)} inches)
        `,n.querySelector("#redo_blindspot").addEventListener("click",w),n.querySelector("#proceed").addEventListener("click",_)}function E(){e.item_width_deg=2*Math.atan(e.item_width_mm/2/e.view_dist_mm)*180/Math.PI,e.px2deg=e.item_width_px/e.item_width_deg;let t=0;switch(i.resize_units){case"cm":case"centimeters":t=e.px2mm*10;break;case"inch":case"inches":t=e.px2mm*25.4;break;case"deg":case"degrees":t=e.px2deg;break}if(t>0){let a=t/i.pixels_per_unit;document.getElementById("jspsych-content").style.transform="scale("+a+")",e.px2deg=e.px2deg/a,e.px2mm=e.px2mm/a,e.item_width_px=e.item_width_px/a,e.scale_factor=a}i.blindspot_reps>0?(e.win_width_deg=window.innerWidth/e.px2deg,e.win_height_deg=window.innerHeight/e.px2deg):(delete e.px2deg,delete e.item_width_deg)}const _=()=>{e.rt=Math.round(performance.now()-$),this.jsPsych.pluginAPI.cancelAllKeyboardResponses(),E(),this.jsPsych.finishTrial(e)},F=()=>{this.container.innerHTML=`
        <div id="virtual-chinrest-circle" style="position: absolute; background-color: #f00; width: ${this.ball_size}px; height: ${this.ball_size}px; border-radius:${this.ball_size}px;"></div>
        <div id="virtual-chinrest-square" style="position: absolute; background-color: #000; width: ${this.ball_size}px; height: ${this.ball_size}px;"></div>
      `;const t=this.container.querySelector("#virtual-chinrest-circle"),a=this.container.querySelector("#virtual-chinrest-square"),o=this.container.getBoundingClientRect().width-this.ball_size,l=o*.85;t.style.left=`${l}px`,a.style.left=`${o}px`,this.ball=t,s.square_pos=h(x(a).x,2)},T=()=>{const t=parseInt(this.ball.style.left);this.ball.style.left=`${t+-2}px`,this.ball_animation_frame_id=requestAnimationFrame(T)},H=()=>{cancelAnimationFrame(this.ball_animation_frame_id),s.ball_pos.push(h(x(this.ball).x,2)),this.reps_remaining--,document.querySelector("#click").textContent=Math.max(this.reps_remaining,0).toString(),this.reps_remaining<=0?R():v()};function N(t){return t/e.item_width_mm}function h(t,a){return+(Math.round(+(t+"e"+a))+"e-"+a)}function x(t){const a=t.getBoundingClientRect();return{x:a.left+a.width/2,y:a.top+a.height/2}}const B=t=>t*Math.PI/180}}return b.info=M,b}(jsPsychModule);
//# sourceMappingURL=https://unpkg.com/@jspsych/plugin-virtual-chinrest@3.1.0/dist/index.browser.min.js.map
