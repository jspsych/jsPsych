/**
 * jspsych-psychophysics
 * Copyright (c) 2019 Daiichiro Kuroki
 * Released under the MIT license
 * 
 * jspsych-psychophysics is a plugin for conducting online/Web-based psychophysical experiments using jsPsych (de Leeuw, 2015). 
 *
 * Please see 
 * http://jspsychophysics.hes.kyushu-u.ac.jp/
 * about how to use this plugin.
 *
 **/

 /* global jsPsych, math, numeric */

jsPsych.plugins["psychophysics"] = (function() {
  console.log(`jsPsych Version ${jsPsych.version()}`)
  console.log('jspsych-psychophysics Version 2.3.1')

  let plugin = {};

  plugin.info = {
    name: 'psychophysics',
    description: 'A plugin for conducting online/Web-based psychophysical experiments',
    parameters: {
      stimuli: {
        type: jsPsych.plugins.parameterType.COMPLEX, // This is similar to the quesions of the survey-likert. 
        array: true,
        pretty_name: 'Stimuli',
        description: 'The objects will be presented in the canvas.',
        nested: {
          startX: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'startX',
            default: 'center',
            description: 'The horizontal start position.'
          },
          startY: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'startY',
            default: 'center',
            description: 'The vertical start position.'
          },
          endX: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'endX',
            default: null,
            description: 'The horizontal end position.'
          },
          endY: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'endY',
            default: null,
            description: 'The vertical end position.'
          },
          show_start_time: {
            type: jsPsych.plugins.parameterType.INT,
            pretty_name: 'Show start time',
            default: 0,
            description: 'Time to start presenting the stimuli'
          },
          show_end_time: {
            type: jsPsych.plugins.parameterType.INT,
            pretty_name: 'Show end time',
            default: null,
            description: 'Time to end presenting the stimuli'
          },
          show_start_frame: {
            type: jsPsych.plugins.parameterType.INT,
            pretty_name: 'Show start frame',
            default: 0,
            description: 'Time to start presenting the stimuli in frames'
          },
          show_end_frame: {
            type: jsPsych.plugins.parameterType.INT,
            pretty_name: 'Show end frame',
            default: null,
            description: 'Time to end presenting the stimuli in frames'
          },
          line_width: {
            type: jsPsych.plugins.parameterType.INT,
            pretty_name: 'Line width',
            default: 1,
            description: 'The line width'
          },
          lineJoin: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'lineJoin',
            default: 'miter',
            description: 'The type of the corner when two lines meet.'
          },
          miterLimit: {
            type: jsPsych.plugins.parameterType.INT,
            pretty_name: 'miterLimit',
            default: 10,
            description: 'The maximum miter length.'
          },
          drawFunc: {
            type: jsPsych.plugins.parameterType.FUNCTION,
            pretty_name: 'Draw function',
            default: null,
            description: 'This function enables to move objects horizontally and vertically.'
          },
          change_attr: {
            type: jsPsych.plugins.parameterType.FUNCTION,
            pretty_name: 'Change attributes',
            default: null,
            description: 'This function enables to change attributes of objects immediately before drawing.'
          },
          is_frame: {
            type: jsPsych.plugins.parameterType.BOOL,
            pretty_name: 'time is in frames',
            default: false,
            description: 'If true, time is treated in frames.'
          },
          origin_center: {
            type: jsPsych.plugins.parameterType.BOOL,
            pretty_name: 'origin_center',
            default: false,
            description: 'The origin is the center of the window.'
          },
          is_presented: {
            type: jsPsych.plugins.parameterType.BOOL,
            pretty_name: 'is_presented',
            default: false,
            description: 'This will be true when the stimulus is presented.'
          },
          trial_ends_after_audio: {
            type: jsPsych.plugins.parameterType.BOOL,
            pretty_name: 'Trial ends after audio',
            default: false,
            description: 'If true, then the trial will end as soon as the audio file finishes playing.'
          },
          tilt: {
            type: jsPsych.plugins.parameterType.FLOAT,
            pretty_name: 'tilt',
            default: 0,
            description: 'The tilt of the gabor patch.'
          },
          sf: {
            type: jsPsych.plugins.parameterType.FLOAT,
            pretty_name: 'spatial frequency',
            default: 0.05,
            description: 'The spatial frequency of the gabor patch.'
          },
          phase: {
            type: jsPsych.plugins.parameterType.FLOAT,
            pretty_name: 'phase',
            default: 0,
            description: 'The phase (degrees) of the gabor patch.'
          },
          sc: {
            type: jsPsych.plugins.parameterType.FLOAT,
            pretty_name: 'standard deviation',
            default: 20,
            description: 'The standard deviation of the distribution.'
          },
          contrast: {
            type: jsPsych.plugins.parameterType.FLOAT,
            pretty_name: 'contrast',
            default: 20,
            description: 'The contrast of the gabor patch.'
          },
          drift: {
            type: jsPsych.plugins.parameterType.FLOAT,
            pretty_name: 'drift',
            default: 0,
            description: 'The velocity of the drifting gabor patch.'
          },
          method: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'gabor_drawing_method',
            default: 'numeric',
            description: 'The method of drawing the gabor patch.'
          },
          disableNorm: {
            type: jsPsych.plugins.parameterType.BOOL,
            pretty_name: 'disableNorm',
            default: false,
            description: 'Disable normalization of the gaussian function.'
          },
          mask_func: {
            type: jsPsych.plugins.parameterType.FUNCTION,
            pretty_name: 'Masking function',
            default: null,
            description: 'Masking the image manually.'
          },

        }
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices',
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus.'
      },
      canvas_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Canvas width',
        default: window.innerWidth,
        description: 'The width of the canvas.'
      },
      canvas_height: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Canvas height',
        default: window.innerHeight,
        description: 'The height of the canvas.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show trial before it ends.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when subject makes a response.'
      },
      background_color: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Background color',
        default: 'grey',
        description: 'The background color of the canvas.'
      },
      response_type: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'key, mouse or button',
        default: 'key',
        description: 'How to make a response.'
      },
      response_start_time: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Response start',
        default: 0,
        description: 'When the subject is allowed to respond to the stimulus.'
      },
      raf_func: {
        type: jsPsych.plugins.parameterType.FUNCTION,
        pretty_name: 'Step function',
        default: null,
        description: 'This function enables to move objects as you wish.'        
      },
      mouse_down_func: {
        type: jsPsych.plugins.parameterType.FUNCTION,
        pretty_name: 'Mouse down function',
        default: null,
        description: 'This function is set to the event listener of the mousedown.'        
      },
      mouse_move_func: {
        type: jsPsych.plugins.parameterType.FUNCTION,
        pretty_name: 'Mouse move function',
        default: null,
        description: 'This function is set to the event listener of the mousemove.'        
      },
      mouse_up_func: {
        type: jsPsych.plugins.parameterType.FUNCTION,
        pretty_name: 'Mouse up function',
        default: null,
        description: 'This function is set to the event listener of the mouseup.'        
      },
      key_down_func:{
        type: jsPsych.plugins.parameterType.FUNCTION,
        pretty_name: 'Key down function',
        default: null,
        description: 'This function is set to the event listener of the keydown.'              
      },
      key_up_func:{
        type: jsPsych.plugins.parameterType.FUNCTION,
        pretty_name: 'Key up function',
        default: null,
        description: 'This function is set to the event listener of the keyup.'              
      },
      button_choices: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button choices',
        // default: undefined,
        default: ['Next'],
        array: true,
        description: 'The labels for the buttons.'
      },
      button_html: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button HTML',
        default: '<button class="jspsych-btn">%choice%</button>',
        array: true,
        description: 'The html of the button. Can create own style.'
      },
      vert_button_margin: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Margin vertical',
        default: '0px',
        description: 'The vertical margin of the button.'
      },
      horiz_button_margin: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Margin horizontal',
        default: '8px',
        description: 'The horizontal margin of the button.'
      },
      clear_canvas: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'clear_canvas',
        default: true,
        description: 'Clear the canvas per frame.'
      }
    }
  }
    
  plugin.trial = function(display_element, trial) {

    // returns an array starting with 'start_num' of which length is 'count'.
    function getNumbering(start_num, count) {
      return [...Array(count)].map((_, i) => i + start_num) 
    }

    // Class for visual and audio stimuli
    class psychophysics_stimulus {
      constructor(stim) {
        Object.assign(this, stim)
        const keys = Object.keys(this)
        for (var i = 0; i < keys.length; i++) {
            if (typeof this[keys[i]] === "function") {
              // オブジェクト内のfunctionはここで指定する必要がある。そうしないとここで即時に実行されて、その結果が関数名に代入される
              if (keys[i] === "drawFunc") continue
              if (keys[i] === "change_attr") continue
              if (keys[i] === "mask_func") continue

              this[keys[i]] = this[keys[i]].call()
            }
        }
      }
    }

    class visual_stimulus extends psychophysics_stimulus {
      constructor(stim) {
        super(stim);
        
        if (this.startX === 'center') {
          if (this.origin_center) {
            this.startX = 0;
          } else {
            this.startX = centerX;
          }
        }
        if (this.startY === 'center') {
          if (this.origin_center) {
            this.startY = 0;
          } else {
            this.startY = centerY;
          }
        }
        if (this.endX === 'center') {
          if (this.origin_center) {
            this.endX = 0;
          } else {
            this.endX = centerX;
          }
        }
        if (this.endY === 'center') {
          if (this.origin_center) {
            this.endY = 0;
          } else {
            this.endY = centerY;
          }
        }

        if (this.origin_center) {
          this.startX = this.startX + centerX;
          this.startY = this.startY + centerY;
          if (this.endX !== null) this.endX = this.endX + centerX;
          if (this.endY !== null) this.endY = this.endY + centerY;
        }

        if (typeof this.motion_start_time === 'undefined') this.motion_start_time = this.show_start_time; // Motion will start at the same time as it is displayed.
        if (typeof this.motion_end_time === 'undefined') this.motion_end_time = null;
        if (typeof this.motion_start_frame === 'undefined') this.motion_start_frame = this.show_start_frame; // Motion will start at the same frame as it is displayed.
        if (typeof this.motion_end_frame === 'undefined') this.motion_end_frame = null;
        
        if (trial.clear_canvas === false && this.show_end_time !== null) alert('You can not specify the show_end_time with the clear_canvas property.');

        // calculate the velocity (pix/sec) using the distance and the time.
        // If the pix_sec is specified, the calc_pix_per_sec returns the intact pix_sec.
        // If the pix_frame is specified, the calc_pix_per_sec returns an undefined.
        this.horiz_pix_sec = this.calc_pix_per_sec('horiz');
        this.vert_pix_sec = this.calc_pix_per_sec('vert');

        // currentX/Y is changed per frame.
        this.currentX = this.startX;
        this.currentY = this.startY;

      }

      calc_pix_per_sec (direction){
        let pix_sec , pix_frame, startPos, endPos;
        if (direction === 'horiz'){
          pix_sec = this.horiz_pix_sec;
          pix_frame = this.horiz_pix_frame;
          startPos = this.startX;
          endPos = this.endX;
        } else {
          pix_sec = this.vert_pix_sec;
          pix_frame = this.vert_pix_frame;
          startPos = this.startY;
          endPos = this.endY;
        }
        const motion_start_time = this.motion_start_time;
        const motion_end_time = this.motion_end_time;
        if ((typeof pix_sec !== 'undefined' || typeof pix_frame !== 'undefined') && endPos !== null && motion_end_time !== null) {
          alert('You can not specify the speed, location, and time at the same time.');
          pix_sec = 0; // stop the motion
        }
        
        if (typeof pix_sec !== 'undefined' || typeof pix_frame !== 'undefined') return pix_sec; // returns an 'undefined' when you specify the pix_frame.
  
        // The velocity is not specified
            
        if (endPos === null) return 0; // This is not motion.
  
        if (startPos === endPos) return 0; // This is not motion.
        
  
        // The distance is specified
  
        if (motion_end_time === null) { // Only the distance is known
          alert('Please specify the motion_end_time or the velocity when you use the endX/Y property.')
          return 0; // stop the motion
        }
  
        return (endPos - startPos)/(motion_end_time/1000 - motion_start_time/1000);
      }

      calc_current_position (direction, elapsed){
        let pix_frame, pix_sec, current_pos, start_pos, end_pos;

        if (direction === 'horiz'){
          pix_frame = this.horiz_pix_frame
          pix_sec = this.horiz_pix_sec
          current_pos = this.currentX
          start_pos = this.startX
          end_pos = this.endX
        } else {
          pix_frame = this.vert_pix_frame
          pix_sec = this.vert_pix_sec
          current_pos = this.currentY
          start_pos = this.startY
          end_pos = this.endY
        }

        const motion_start = this.is_frame ? this.motion_start_frame : this.motion_start_time;
        const motion_end = this.is_frame ? this.motion_end_frame : this.motion_end_time;

        if (elapsed < motion_start) return current_pos
        if (motion_end !== null && elapsed >= motion_end) return current_pos

        // Note that: You can not specify the speed, location, and time at the same time.

        let ascending = true; // true = The object moves from left to right, or from up to down.

        if (typeof pix_frame === 'undefined'){ // In this case, pix_sec is defined.
          if (pix_sec < 0) ascending = false;
        } else {
          if (pix_frame < 0) ascending = false;
        }

        if (end_pos === null || (ascending && current_pos <= end_pos) || (!ascending && current_pos >= end_pos)) {
          if (typeof pix_frame === 'undefined'){ // In this case, pix_sec is defined.
            return start_pos + Math.round(pix_sec * (elapsed - motion_start)/1000); // This should be calculated in seconds.
          } else {
            return current_pos + pix_frame; 
          }
        } else {
          return current_pos
        }
      }

      update_position(elapsed){
        this.currentX = this.calc_current_position ('horiz', elapsed)
        this.currentY = this.calc_current_position ('vert', elapsed)
      }
    }

    class image_stimulus extends visual_stimulus {
      constructor(stim){
        super(stim);

        if (typeof this.file === 'undefined') {
          alert('You have to specify the file property.');
          return;
        }
        this.img = new Image();
        this.img.src = this.file;

        if (typeof this.mask !== 'undefined' || typeof this.filter !== 'undefined') {
          // For masking and filtering, draw the image on another canvas and get its pixel data using the getImageData function.
          // In addition, masking does work only online, that is, the javascript and image files must be uploaded on the web server.

          if (document.getElementById('invisible_canvas') === null) {
            const canvas_element = document.createElement('canvas');
            canvas_element.id = 'invisible_canvas';
            display_element.appendChild(canvas_element)
            canvas_element.style.display = 'none'
          } 

          const invisible_canvas = document.getElementById('invisible_canvas');
          invisible_canvas.width = this.img.width // The width/height of the canvas is not automatically adjusted.
          invisible_canvas.height = this.img.height
          const invisible_ctx = invisible_canvas.getContext('2d');
          invisible_ctx.clearRect(0, 0, invisible_canvas.width, invisible_canvas.height);

          if (typeof this.filter === 'undefined') {
            invisible_ctx.filter = 'none'
          } else {
            invisible_ctx.filter = this.filter
          }
  
          invisible_ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height);

          if (typeof this.mask === 'undefined'){ // Filtering only
            const invisible_img = invisible_ctx.getImageData(0, 0, this.img.width, this.img.height);
            this.masking_img = invisible_img;
            return
          }

          if (this.mask === 'manual'){
            if (this.mask_func === null) {
              alert('You have to specify the mask_func when applying masking manually.');
              return;
            }
            this.masking_img = this.mask_func(invisible_canvas);
            return
          }
    
          if (this.mask === 'gauss'){
            if (typeof this.width === 'undefined') {
              alert('You have to specify the width property for the gaussian mask. For example, 200.');
              return;
            }
            const gauss_width = this.width
            
            // 画像の全体ではなく、フィルタリングを行う部分だけを取り出す
            // Getting only the areas to be filtered, not the whole image.
            const invisible_img = invisible_ctx.getImageData(this.img.width/2 - gauss_width/2, this.img.height/2 - gauss_width/2, gauss_width, gauss_width);

            let coord_array = getNumbering(Math.round(0 - gauss_width/2), gauss_width)
            let coord_matrix_x = []
            for (let i = 0; i< gauss_width; i++){
              coord_matrix_x.push(coord_array)
            }
    
            coord_array = getNumbering(Math.round(0 - gauss_width/2), gauss_width)
            let coord_matrix_y = []
            for (let i = 0; i< gauss_width; i++){
              coord_matrix_y.push(coord_array)
            }
    
            let exp_value;
            if (this.method === 'math') {
              const matrix_x = math.matrix(coord_matrix_x) // Convert to Matrix data
              const matrix_y = math.transpose(math.matrix(coord_matrix_y))
              const x_factor = math.multiply(-1, math.square(matrix_x))
              const y_factor = math.multiply(-1, math.square(matrix_y))
              const varScale = 2 * math.square(this.sc)
              const tmp = math.add(math.divide(x_factor, varScale), math.divide(y_factor, varScale));
              exp_value = math.exp(tmp)
            } else { // numeric
              const matrix_x = coord_matrix_x
              const matrix_y = numeric.transpose(coord_matrix_y)
              const x_factor = numeric.mul(-1, numeric.pow(matrix_x, 2))
              const y_factor = numeric.mul(-1, numeric.pow(matrix_y, 2))
              const varScale = 2 * numeric.pow([this.sc], 2)
              const tmp = numeric.add(numeric.div(x_factor, varScale), numeric.div(y_factor, varScale));
              exp_value = numeric.exp(tmp)
            }
          
            let cnt = 3;
            for (let i = 0; i < gauss_width; i++) {
              for (let j = 0; j < gauss_width; j++) {
                invisible_img.data[cnt] = exp_value[i][j] * 255 // 透明度を変更
                cnt = cnt + 4;
              }
            }
            this.masking_img = invisible_img;
            return
          }

          if (this.mask === 'circle' || this.mask === 'rect'){
            if (typeof this.width === 'undefined') {
              alert('You have to specify the width property for the circle/rect mask.');
              return;
            }
            if (typeof this.height === 'undefined') {
              alert('You have to specify the height property for the circle/rect mask.');
              return;
            }
            if (typeof this.center_x === 'undefined') {
              alert('You have to specify the center_x property for the circle/rect mask.');
              return;
            }
            if (typeof this.center_y === 'undefined') {
              alert('You have to specify the center_y property for the circle/rect mask.');
              return;
            }

            const oval_width = this.width
            const oval_height = this.height
            const oval_cx = this.center_x
            const oval_cy = this.center_y
                        
            // 画像の全体ではなく、フィルタリングを行う部分だけを取り出す
            // Getting only the areas to be filtered, not the whole image.
            const invisible_img = invisible_ctx.getImageData(oval_cx - oval_width/2, oval_cy - oval_height/2, oval_width, oval_height);

            const cx = invisible_img.width/2
            const cy = invisible_img.height/2

            if (this.mask === 'circle'){
              let cnt = 3;
              for (let j = 0; j < oval_height; j++) {
                for (let i = 0; i < oval_width; i++) {
                  const tmp = Math.pow(i-cx, 2)/Math.pow(cx, 2) + Math.pow(j-cy, 2)/Math.pow(cy, 2)
                  if (tmp > 1){
                    invisible_img.data[cnt] = 0 // invisible
                  }
                  cnt = cnt + 4;
                }
              }
            }

            // When this.mask === 'rect', the alpha (transparency) value does not chage at all.

            this.masking_img = invisible_img;
            return
          }
        }  
      }

      show(){
        if (this.mask || this.filter){
          // Note that filtering is done to the invisible_ctx.
          ctx.putImageData(this.masking_img, this.currentX - this.masking_img.width/2, this.currentY - this.masking_img.height/2);
        } else {
          const scale = typeof this.scale === 'undefined' ? 1:this.scale;
          const tmpW = this.img.width * scale;
          const tmpH = this.img.height * scale;              
          ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height, this.currentX - tmpW / 2, this.currentY - tmpH / 2, tmpW, tmpH);   
        }
      }
    }

    class gabor_stimulus extends visual_stimulus {
      constructor(stim){
        super(stim);
        this.update_count = 0;
      }

      show(){
        ctx.putImageData(this.img_data, this.currentX - this.img_data.width/2, this.currentY - this.img_data.height/2)
      }

      update_position(elapsed){
        
        this.currentX = this.calc_current_position ('horiz', elapsed)
        this.currentY = this.calc_current_position ('vert', elapsed)

        if (typeof this.img_data !== 'undefined' && this.drift === 0) return

        let gabor_data;
        // console.log(this.method)

        // The following calculation method is based on Psychtoolbox (MATLAB), 
        // although it doesn't use procedural texture mapping.
        // I also have referenced the gaborgen-js code: https://github.com/jtth/gaborgen-js 

        // You can choose either the numeric.js or the math.js as the method for drawing gabor patches.
        // The numeric.js is considerably faster than the math.js, but the latter is being developed more aggressively than the former.
        // Note that "Math" and "math" are not the same.

        let coord_array = getNumbering(Math.round(0 - this.width/2), this.width)
        let coord_matrix_x = []
        for (let i = 0; i< this.width; i++){
          coord_matrix_x.push(coord_array)
        }

        coord_array = getNumbering(Math.round(0 - this.width/2), this.width)
        let coord_matrix_y = []
        for (let i = 0; i< this.width; i++){
          coord_matrix_y.push(coord_array)
        }

        const tilt_rad = deg2rad(90 - this.tilt)

        // These values are scalars.
        const a = Math.cos(tilt_rad) * this.sf * (2 * Math.PI) // radians
        const b = Math.sin(tilt_rad) * this.sf * (2 * Math.PI)
        let multConst = 1 / (Math.sqrt(2*Math.PI) * this.sc) 
        if (this.disableNorm) multConst = 1

        
        // const phase_rad = deg2rad(this.phase)
        const phase_rad = deg2rad(this.phase + this.drift * this.update_count)
        this.update_count += 1

        if (this.method === 'math') {
          const matrix_x = math.matrix(coord_matrix_x) // Convert to Matrix data
          const matrix_y = math.transpose(math.matrix(coord_matrix_y))
          const x_factor = math.multiply(-1, math.square(matrix_x))
          const y_factor = math.multiply(-1, math.square(matrix_y))
          const tmp1 = math.add(math.multiply(a, matrix_x), math.multiply(b, matrix_y), phase_rad) // radians
          const sinWave = math.sin(tmp1)
          const varScale = 2 * math.square(this.sc)
          const tmp2 = math.add(math.divide(x_factor, varScale), math.divide(y_factor, varScale));
          const exp_value = math.exp(tmp2)
          const tmp3 = math.dotMultiply(exp_value, sinWave)
          const tmp4 = math.multiply(multConst, tmp3)
          const tmp5 = math.multiply(this.contrast, tmp4)
          const m = math.multiply(256, math.add(0.5, tmp5))
          gabor_data = m._data
        } else { // numeric
          const matrix_x = coord_matrix_x
          const matrix_y = numeric.transpose(coord_matrix_y)
          const x_factor = numeric.mul(-1, numeric.pow(matrix_x, 2))
          const y_factor = numeric.mul(-1, numeric.pow(matrix_y, 2))
          const tmp1 = numeric.add(numeric.mul(a, matrix_x), numeric.mul(b, matrix_y), phase_rad) // radians
          const sinWave = numeric.sin(tmp1)
          const varScale = 2 * numeric.pow([this.sc], 2)
          const tmp2 = numeric.add(numeric.div(x_factor, varScale), numeric.div(y_factor, varScale));
          const exp_value = numeric.exp(tmp2)
          const tmp3 = numeric.mul(exp_value, sinWave)
          const tmp4 = numeric.mul(multConst, tmp3)
          const tmp5 = numeric.mul(this.contrast, tmp4)
          const m = numeric.mul(256, numeric.add(0.5, tmp5))
          gabor_data = m
        }
        // console.log(gabor_data)
        const imageData = ctx.createImageData(this.width, this.width);
        let cnt = 0;
        // Iterate through every pixel
        for (let i = 0; i < this.width; i++) {
          for (let j = 0; j < this.width; j++) {
            // Modify pixel data
            imageData.data[cnt] = Math.round(gabor_data[i][j]);  // R value
            cnt++;
            imageData.data[cnt] = Math.round(gabor_data[i][j]);  // G
            cnt++;
            imageData.data[cnt] = Math.round(gabor_data[i][j]);  // B
            cnt++;
            imageData.data[cnt] = 255;  // alpha
            cnt++;
          }
        }

        this.img_data = imageData
      }
    }

    class line_stimulus extends visual_stimulus{
      constructor(stim){
        super(stim)

        if (typeof this.angle === 'undefined') {
          if ((typeof this.x1 === 'undefined') || (typeof this.x2 === 'undefined') || (typeof this.y1 === 'undefined') || (typeof this.y2 === 'undefined')){
            alert('You have to specify the angle of lines, or the start (x1, y1) and end (x2, y2) coordinates.');
            return;
          }
          // The start (x1, y1) and end (x2, y2) coordinates are defined.
          // For motion, startX/Y must be calculated.
          this.startX = (this.x1 + this.x2)/2;
          this.startY = (this.y1 + this.y2)/2;
          if (this.origin_center) {
            this.startX = this.startX + centerX;
            this.startY = this.startY + centerY;
          }  
          this.currentX = this.startX;
          this.currentY = this.startY;
          this.angle = Math.atan((this.y2 - this.y1)/(this.x2 - this.x1)) * (180 / Math.PI);
          this.line_length = Math.sqrt((this.x2 - this.x1) ** 2 + (this.y2 - this.y1) ** 2);
        } else {
          if ((typeof this.x1 !== 'undefined') || (typeof this.x2 !== 'undefined') || (typeof this.y1 !== 'undefined') || (typeof this.y2 !== 'undefined'))
            alert('You can not specify the angle and positions of the line at the same time.')
          if (typeof this.line_length === 'undefined') alert('You have to specify the line_length property.');
          
        }
        if (typeof this.line_color === 'undefined') this.line_color = '#000000';
  
      }

      show(){
        if (typeof this.filter === 'undefined') {
          ctx.filter = 'none'
        } else {
          ctx.filter = this.filter
        }

        // common
        ctx.beginPath();            
        ctx.lineWidth = this.line_width;
        ctx.lineJoin = this.lineJoin;
        ctx.miterLimit = this.miterLimit;
        //
        const theta = deg2rad(this.angle);
        const x1 = this.currentX - this.line_length/2 * Math.cos(theta);
        const y1 = this.currentY - this.line_length/2 * Math.sin(theta);
        const x2 = this.currentX + this.line_length/2 * Math.cos(theta);
        const y2 = this.currentY + this.line_length/2 * Math.sin(theta);
        ctx.strokeStyle = this.line_color;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

      }
    }

    class rect_stimulus extends visual_stimulus{
      constructor(stim){
        super(stim)

        if (typeof this.width === 'undefined') alert('You have to specify the width of the rectangle.');
        if (typeof this.height === 'undefined') alert('You have to specify the height of the rectangle.');
        if (typeof this.line_color === 'undefined' && typeof this.fill_color === 'undefined') alert('You have to specify the either of the line_color or fill_color property.');      
  
      }

      show(){
        if (typeof this.filter === 'undefined') {
          ctx.filter = 'none'
        } else {
          ctx.filter = this.filter
        }

        // common
        // ctx.beginPath();            
        ctx.lineWidth = this.line_width;
        ctx.lineJoin = this.lineJoin;
        ctx.miterLimit = this.miterLimit;
        //
        // First, draw a filled rectangle, then an edge.
        if (typeof this.fill_color !== 'undefined') {
          ctx.fillStyle = this.fill_color;
          ctx.fillRect(this.currentX-this.width/2, this.currentY-this.height/2, this.width, this.height); 
        } 
        if (typeof this.line_color !== 'undefined') {
          ctx.strokeStyle = this.line_color;
          ctx.strokeRect(this.currentX-this.width/2, this.currentY-this.height/2, this.width, this.height);
        }      

      }
    }

    class cross_stimulus extends visual_stimulus {
      constructor(stim) {
        super(stim);
        
        if (typeof this.line_length === 'undefined') alert('You have to specify the line_length of the fixation cross.');
        if (typeof this.line_color === 'undefined') this.line_color = '#000000';
      }

      show(){
        if (typeof this.filter === 'undefined') {
          ctx.filter = 'none'
        } else {
          ctx.filter = this.filter
        }

        // common
        ctx.beginPath();            
        ctx.lineWidth = this.line_width;
        ctx.lineJoin = this.lineJoin;
        ctx.miterLimit = this.miterLimit;
        //
        ctx.strokeStyle = this.line_color;
        const x1 = this.currentX;
        const y1 = this.currentY - this.line_length/2;
        const x2 = this.currentX;
        const y2 = this.currentY + this.line_length/2;                
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        const x3 = this.currentX - this.line_length/2;
        const y3 = this.currentY;
        const x4 = this.currentX + this.line_length/2;
        const y4 = this.currentY;                
        ctx.moveTo(x3, y3);
        ctx.lineTo(x4, y4);
        // ctx.closePath();
        ctx.stroke();
      }
    }
  
    class circle_stimulus extends visual_stimulus {
      constructor(stim){
        super(stim);
        
        if (typeof this.radius === 'undefined') alert('You have to specify the radius of circles.');
        if (typeof this.line_color === 'undefined' && typeof this.fill_color === 'undefined') alert('You have to specify the either of line_color or fill_color.');      
      }

      show(){
        if (typeof this.filter === 'undefined') {
          ctx.filter = 'none'
        } else {
          ctx.filter = this.filter
        }

        // common
        ctx.beginPath();            
        ctx.lineWidth = this.line_width;
        ctx.lineJoin = this.lineJoin;
        ctx.miterLimit = this.miterLimit;
        //
        if (typeof this.fill_color !== 'undefined') {
          ctx.fillStyle = this.fill_color;
          ctx.arc(this.currentX, this.currentY, this.radius, 0, Math.PI*2, false);
          ctx.fill();
        } 
        if (typeof this.line_color !== 'undefined') {
          ctx.strokeStyle = this.line_color;
          ctx.arc(this.currentX, this.currentY, this.radius, 0, Math.PI*2, false);
          ctx.stroke();
        }

      }
    }
    
    class text_stimulus extends visual_stimulus {
      constructor(stim){
        super(stim)

        if (typeof this.content === 'undefined') alert('You have to specify the content of texts.');
        if (typeof this.text_color === 'undefined') this.text_color = '#000000';
        if (typeof this.text_space === 'undefined') this.text_space = 20;
  
      }

      show(){
        if (typeof this.filter === 'undefined') {
          ctx.filter = 'none'
        } else {
          ctx.filter = this.filter
        }

        // common
        // ctx.beginPath();            
        ctx.lineWidth = this.line_width;
        ctx.lineJoin = this.lineJoin;
        ctx.miterLimit = this.miterLimit;
        //
        if (typeof this.font !== 'undefined') ctx.font = this.font;

        ctx.fillStyle = this.text_color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle"

        let column = [''];
        let line = 0;
        for (let i = 0; i < this.content.length; i++) {
            let char = this.content.charAt(i);

            if (char == "\n") {    
                line++;
                column[line] = '';
            } else {
              column[line] += char;
            }
        }

        for (let i = 0; i < column.length; i++) {
            ctx.fillText(column[i], this.currentX, this.currentY - this.text_space * (column.length-1) / 2 + this.text_space * i);
        }

      }
    }

    class manual_stimulus extends visual_stimulus{
      constructor(stim){
        super(stim)
      }

      show(){}
    }

    class audio_stimulus extends psychophysics_stimulus{
      constructor(stim){
        super(stim)

        if (typeof this.file === 'undefined') {
          alert('You have to specify the file property.')
          return;
        }

        // setup stimulus
        this.context = jsPsych.pluginAPI.audioContext();

        // load audio file
        jsPsych.pluginAPI.getAudioBuffer(this.file)
          .then(function (buffer) {
            if (this.context !== null) {
              this.audio = this.context.createBufferSource();
              this.audio.buffer = buffer;
              this.audio.connect(this.context.destination);
              console.log('WebAudio')
            } else {
              this.audio = buffer;
              this.audio.currentTime = 0;
              console.log('HTML5 audio')
            }
            // setupTrial();
          }.bind(this))
          .catch(function (err) {
            console.error(`Failed to load audio file "${this.file}". Try checking the file path. We recommend using the preload plugin to load audio files.`)
            console.error(err)
          }.bind(this));

  
        // set up end event if trial needs it
        if (this.trial_ends_after_audio) {
          this.audio.addEventListener('ended', end_trial);
        }
      }
  
      play(){
        // start audio
        if(this.context !== null){
          //startTime = this.context.currentTime; 
          // オリジナルのjspsychではwebaudioが使えるときは時間のデータとしてcontext.currentTimeを使っている。
          // psychophysicsプラグインでは、performance.now()で統一している
          this.audio.start(this.context.currentTime);
        } else {
          this.audio.play();
        }
      }

      stop(){
        if(this.context !== null){
          this.audio.stop();
          // this.source.onended = function() { }
        } else {
          this.audio.pause();
          
        }
        this.audio.removeEventListener('ended', end_trial);

      }
    }

    if (typeof trial.stepFunc !== 'undefined') alert(`The stepFunc is no longer supported. Please use the raf_func instead.`)

    const elm_jspsych_content = document.getElementById('jspsych-content');
    const style_jspsych_content = window.getComputedStyle(elm_jspsych_content); // stock
    const default_maxWidth = style_jspsych_content.maxWidth;
    elm_jspsych_content.style.maxWidth = 'none'; // The default value is '95%'. To fit the window.

    let new_html = '<canvas id="myCanvas" class="jspsych-canvas" width=' + trial.canvas_width + ' height=' + trial.canvas_height + ' style="background-color:' + trial.background_color + ';"></canvas>';

    const motion_rt_method = 'performance'; // 'date' or 'performance'. 'performance' is better.
    let start_time; // used for mouse and button responses.
    let keyboardListener;

    // allow to respond using keyboard mouse or button
    jsPsych.pluginAPI.setTimeout(function() {
      if (trial.response_type === 'key'){
        if (trial.choices != jsPsych.NO_KEYS) {
          keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
            callback_function: after_response,
            valid_responses: trial.choices,
            rt_method: motion_rt_method,
            persist: false,
            allow_held_key: false
          });
        }  
      } else if (trial.response_type === 'mouse')  {

        if (motion_rt_method == 'date') {
          start_time = (new Date()).getTime();
        } else {
          start_time = performance.now();
        }

        canvas.addEventListener("mousedown", mouseDownFunc);
      } else { // button
        start_time = performance.now();
        for (let i = 0; i < trial.button_choices.length; i++) {
          display_element.querySelector('#jspsych-image-button-response-button-' + i).addEventListener('click', function(e){
            const choice = e.currentTarget.getAttribute('data-choice'); // don't use dataset for jsdom compatibility
            // after_response(choice);
            // console.log(performance.now())
            // console.log(start_time)
            after_response({
              key: -1,
              rt: performance.now() - start_time,
              button: choice,
          });
    
          });
        }
      }
    }, trial.response_start_time);

    //display buttons
    if (trial.response_type === 'button'){
      let buttons = [];
      if (Array.isArray(trial.button_html)) {
        if (trial.button_html.length == trial.button_choices.length) {
          buttons = trial.button_html;
        } else {
          console.error('Error: The length of the button_html array does not equal the length of the button_choices array');
        }
      } else {
        for (let i = 0; i < trial.button_choices.length; i++) {
          buttons.push(trial.button_html);
        }
      }
      new_html += '<div id="jspsych-image-button-response-btngroup">';
      for (let i = 0; i < trial.button_choices.length; i++) {
        let str = buttons[i].replace(/%choice%/g, trial.button_choices[i]);
        new_html += '<div class="jspsych-image-button-response-button" style="display: inline-block; margin:'+trial.vert_button_margin+' '+trial.horiz_button_margin+'" id="jspsych-image-button-response-button-' + i +'" data-choice="'+i+'">'+str+'</div>';
      }
      new_html += '</div>';
  
    }
    

    // add prompt
    if(trial.prompt !== null){
      new_html += trial.prompt;
    }

    // draw
    display_element.innerHTML = new_html;


    const canvas = document.getElementById('myCanvas');
    if ( ! canvas || ! canvas.getContext ) {
      alert('This browser does not support the canvas element.');
      return;
    }
    const ctx = canvas.getContext('2d');

    trial.canvas = canvas;
    trial.context = ctx;
    
    const centerX = canvas.width/2;
    const centerY = canvas.height/2;
    trial.centerX = centerX;
    trial.centerY = centerY;
    
    // add event listeners defined by experimenters.
    if (trial.mouse_down_func !== null){
      canvas.addEventListener("mousedown", trial.mouse_down_func);
    }

    if (trial.mouse_move_func !== null){
      canvas.addEventListener("mousemove", trial.mouse_move_func);
    }

    if (trial.mouse_up_func !== null){
      canvas.addEventListener("mouseup", trial.mouse_up_func);
    }
    
    if (trial.key_down_func !== null){
      document.addEventListener("keydown", trial.key_down_func); // It doesn't work if the canvas is specified instead of the document.
    }

    if (trial.key_up_func !== null){
      document.addEventListener("keyup", trial.key_up_func);
    }

    if (typeof trial.stimuli === 'undefined' && trial.raf_func === null){
      alert('You have to specify the stimuli/raf_func parameter in the psychophysics plugin.')
      return
    }

 
    /////////////////////////////////////////////////////////
    // make instances
    const oop_stim = []
    const set_instance = {
      sound: audio_stimulus,
      image: image_stimulus,
      line: line_stimulus,
      rect: rect_stimulus,
      circle: circle_stimulus,
      text: text_stimulus,
      cross: cross_stimulus,
      manual: manual_stimulus,
      gabor: gabor_stimulus
    }
    if (typeof trial.stimuli !== 'undefined') { // The stimuli could be 'undefined' if the raf_func is specified.
      for (let i = 0; i < trial.stimuli.length; i++){
        const stim = trial.stimuli[i];
        if (typeof stim.obj_type === 'undefined'){
          alert('You have missed to specify the obj_type property in the ' + (i+1) + 'th object.');
          return
        }
        oop_stim.push(new set_instance[stim.obj_type](stim))
      }
    }
    trial.stim_array = oop_stim
    // for (let i = 0; i < trial.stim_array.length; i++){
    //   console.log(trial.stim_array[i].is_presented)
    // }

    function mouseDownFunc(e){
      
      let click_time;
      
      if (motion_rt_method == 'date') {
        click_time = (new Date()).getTime();
      } else {
        click_time = performance.now();
      }
      
      e.preventDefault();
      
      after_response({
          key: -1,
          rt: click_time - start_time,
          // clickX: e.clientX,
          // clickY: e.clientY,
          clickX: e.offsetX,
          clickY: e.offsetY,
      });
    }

    let startStep = null;
    let sumOfStep;
    let elapsedTime;
    //let currentX, currentY;
    function step(timestamp){
      if (!startStep) {
        startStep = timestamp;
        sumOfStep = 0;
      } else {
        sumOfStep += 1;
      }
      elapsedTime = timestamp - startStep; // unit is ms. This can be used within the raf_func().

      if (trial.clear_canvas)
        ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (trial.raf_func !== null) {        
        trial.raf_func(trial, elapsedTime, sumOfStep); // customize
        frameRequestID = window.requestAnimationFrame(step);
        return
      }

      for (let i = 0; i < trial.stim_array.length; i++){
        const stim = trial.stim_array[i];
        const elapsed = stim.is_frame ? sumOfStep : elapsedTime;
        const show_start = stim.is_frame ? stim.show_start_frame : stim.show_start_time;
        const show_end = stim.is_frame ? stim.show_end_frame : stim.show_end_time;

        if (stim.obj_type === 'sound'){
          if (elapsed >= show_start && !stim.is_presented){
            stim.play(); // play the sound.
            stim.is_presented = true;
          }
          continue;
        }

        // visual stimuli
        if (elapsed < show_start) continue;
        if (show_end !== null && elapsed >= show_end) continue;
        if (trial.clear_canvas === false && stim.is_presented) continue;

        stim.update_position(elapsed);

        if (stim.drawFunc !== null) {
          stim.drawFunc(stim, canvas, ctx);
        } else {
          if (stim.change_attr != null) stim.change_attr(stim, elapsedTime, sumOfStep)
          stim.show()
        }
        stim.is_presented = true;
      }
      frameRequestID = window.requestAnimationFrame(step);
    }
    
    // Start the step function.
    let frameRequestID = window.requestAnimationFrame(step);

    
    function deg2rad(degrees){
      return degrees / 180 * Math.PI;
    }

    // store response
    let response = {
      rt: null,
      key: null
    };

    // function to end trial when it is time
    // let end_trial = function() { // This causes an initialization error at stim.audio.addEventListener('ended', end_trial); 
    function end_trial(){
      // console.log(default_maxWidth)
      document.getElementById('jspsych-content').style.maxWidth = default_maxWidth; // restore
      window.cancelAnimationFrame(frameRequestID); //Cancels the frame request
      canvas.removeEventListener("mousedown", mouseDownFunc);

      // remove event listeners defined by experimenters.
      if (trial.mouse_down_func !== null){
        canvas.removeEventListener("mousedown", trial.mouse_down_func);
      }
  
      if (trial.mouse_move_func !== null){
        canvas.removeEventListener("mousemove", trial.mouse_move_func);
      }
  
      if (trial.mouse_up_func !== null){
        canvas.removeEventListener("mouseup", trial.mouse_up_func);
      }
  
      if (trial.key_down_func !== null){
        document.removeEventListener("keydown", trial.key_down_func);
      }

      if (trial.key_up_func !== null){
        document.removeEventListener("keyup", trial.key_up_func);
      }

      // stop the audio file if it is playing
      // remove end event listeners if they exist
      if (typeof trial.stim_array !== 'undefined') { // The stimuli could be 'undefined' if the raf_func is specified.
        for (let i = 0; i < trial.stim_array.length; i++){
          const stim = trial.stim_array[i];
          // stim.is_presented = false;
          // if (typeof stim.context !== 'undefined') { // If the stimulus is audio data
          if (stim.obj_type === 'sound') { // If the stimulus is audio data
            stim.stop();
          }
        }
      }

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial //音の再生時からの反応時間をとるわけではないから不要？
      // if(context !== null && response.rt !== null){
      //   response.rt = Math.round(response.rt * 1000);
      // }

      // gather the data to store for the trial
      const trial_data = {}
      trial_data['rt'] = response.rt;
      trial_data['response_type'] = trial.response_type;
      trial_data['key_press'] = response.key;
      trial_data['response'] = response.key; // compatible with the jsPsych >= 6.3.0
      trial_data['avg_frame_time'] = elapsedTime/sumOfStep;
      trial_data['center_x'] = centerX;
      trial_data['center_y'] = centerY;

      if (trial.response_type === 'mouse'){
        trial_data['click_x'] = response.clickX;
        trial_data['click_y'] = response.clickY;
      } else if (trial.response_type === 'button'){
        trial_data['button_pressed'] = response.button;
      }

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    }

    // function to handle responses by the subject
    // let after_response = function(info) { // This causes an initialization error at stim.audio.addEventListener('ended', end_trial); 
    function after_response(info) {

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      //display_element.querySelector('#jspsych-html-keyboard-response-stimulus').className += ' responded';

      // only record the first response
      if (response.key == null) {
        response = info;
      }

      if (trial.response_type === 'button'){
        // after a valid response, the stimulus will have the CSS class 'responded'
        // which can be used to provide visual feedback that a response was recorded
        // display_element.querySelector('#jspsych-image-button-response-stimulus').className += ' responded';

        // disable all the buttons after a response
        let btns = document.querySelectorAll('.jspsych-image-button-response-button button');
        for(let i=0; i<btns.length; i++){
          //btns[i].removeEventListener('click');
          btns[i].setAttribute('disabled', 'disabled');
        }
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    }

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

  };

  return plugin;
})();
