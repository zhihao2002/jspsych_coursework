# 钓鱼风险任务 (Angling Risk Task)

以下是捕获或释放任务的 JavaScript 实现，使用 jsPsych 库。

```javascript
// Reference: [http://www.ncbi.nlm.nih.gov/pubmed/18193561]
// Decision Making and Learning While Taking Sequential Risks. Pleskac 2008

/* ************************************ */
/* Define helper functions */
function evalAttentionChecks() {
  var check_percent = 1
  if (run_attention_checks) {
    var attention_check_trials = jsPsych.data.getTrialsOfType('attention-check')
    var checks_passed = 0
    for (var i = 0; i < attention_check_trials.length; i++) {
      if (attention_check_trials[i].correct === true) {
        checks_passed += 1
      }
    }
    check_percent = checks_passed / attention_check_trials.length
  }
  return check_percent
}

function assessPerformance() {
  var experiment_data = jsPsych.data.getTrialsOfType('single-stim-button')
  var missed_count = 0
  var trial_count = 0
  var rt_array = []
  var rt = 0
  for (var i = 0; i < experiment_data.length; i++) {
    rt = experiment_data[i].rt
    trial_count += 1
    if (rt == -1) {
      missed_count += 1
    } else {
      rt_array.push(rt)
    }
  }
  //calculate average rt
  var sum = 0
  for (var j = 0; j < rt_array.length; j++) {
    sum += rt_array[j]
  }
  var avg_rt = sum / rt_array.length || -1
  var missed_percent = missed_count/experiment_data.length
  var credit_var = (missed_percent < 0.4 && avg_rt > 200)
  if (credit_var === true) {
    performance_var = total_points
  } else {
    performance_var = 0
  }
  jsPsych.data.addDataToLastTrial({"credit_var": credit_var, "performance_var": performance_var})
}

var getInstructFeedback = function() {
  return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text +
    '</p></div>'
}

function appendTextAfter(input, search_term, new_text) {
  var index = input.indexOf(search_term) + search_term.length
  return input.slice(0, index) + new_text + input.slice(index)
}

function getRoundOverText() {
  return '<div class = centerbox><p class = center-block-text>' + round_over_text +
    ' 本轮比赛结束。</p><p class = center-block-text>按<strong>enter</strong> 键开始。</p></div>'
}

function getGame() {
  /* At the beginning of each round the task displays either a new lake (if a new tournament is starting)
  or the state of the lake from the last round after the action had been chosen. This function works
  by editing "game_setup" a string which determines the html to display, followed by calling the "makeFish"
  function, which...makes fish.
  */
  if (total_fish_num === 0) {
    round_over = 0
    trial_num = 0
    game_state = game_setup
    game_state = appendTextAfter(game_state, '旅行银行(得分): </strong>', trip_bank)
    game_state = appendTextAfter(game_state, '锦标赛银行: </strong>', tournament_bank)
    game_state = appendTextAfter(game_state, '储存的红鱼: </strong>', 0)
    game_state = appendTextAfter(game_state, "捕捉N' ", release)
    game_state = appendTextAfter(game_state, "weathertext>", weather)
    $('.jspsych-display-element').html(game_state)
    if (weather == "晴天") {
      $('.lake').css("background-color", "LightBlue")
    } else {
      $('.lake').css("background-color", "CadetBlue")
    }
    makeFish(start_fish_num)
  } else {
    // Update game state with cached values
    game_state = game_setup
    game_state = appendTextAfter(game_state, 'lake>', lake_state)
    if (weather == "晴天") {
      game_state = appendTextAfter(game_state, '# 湖中红鱼的数量: </strong>', red_fish_num)
      game_state = appendTextAfter(game_state, '# 湖中蓝鱼的数量: </strong>', total_fish_num -
        red_fish_num)
    }
    game_state = appendTextAfter(game_state, '旅行银行(得分): </strong>', trip_bank)
    game_state = appendTextAfter(game_state, '锦标赛银行: </strong>', tournament_bank)
    game_state = appendTextAfter(game_state, "捕获或", release)
    game_state = appendTextAfter(game_state, "weathertext>", weather)
    if (release == "保留") {
      game_state = appendTextAfter(game_state, '储存的红鱼: </strong>', trip_bank)
    }
    $('.jspsych-display-element').html(game_state)
    if (weather == "晴天") {
      $('.lake').css("background-color", "LightBlue")
    } else {
      $('.lake').css("background-color", "CadetBlue")
    }
    makeFish(total_fish_num)
  }
}

function get_data() {
  /* Records state of the world before the person made their choice */
  var data = {
    exp_stage: "test",
    trial_id: "stim",
    red_fish_num: red_fish_num,
    trip_bank: trip_bank,
    tournament_bank: tournament_bank,
    weather: weather,
    release: release,
    round_num: round_num,
    trial_num: trial_num
  }
  trial_num += 1
  return data
}

function get_practice_data() {
  /* Records state of the world before the person made their choice */
  var data = {
    exp_stage: "practice",
    trial_id: "stim",
    red_fish_num: red_fish_num,
    trip_bank: trip_bank,
    tournament_bank: tournament_bank,
    weather: weather,
    release: release,
    round_num: round_num,
    trial_num: trial_num
  }
  trial_num += 1
  return data
}

function makeFish(fish_num) {
  /* This function makes fish. This includes setting the global variables that track fish number and displaying the
  fish in the lake if it is sunny out. It uses the placeFish function to set the fish locations

  */
  $(".redfish").remove();
  $(".bluefish").remove();
  $(".greyfish").remove();
  red_fish_num = 0
  total_fish_num = 0
  filled_areas = [];
  if (max_x === 0) {
    min_x = $('.lake').width() * 0.05;
    min_y = $('.lake').height() * 0.05;
    max_x = $('.lake').width() * 0.9;
    max_y = $('.lake').height() * 0.9;
  }
  for (i = 0; i < fish_num - 1; i++) {
    red_fish_num += 1
    if (weather == "晴天") {
      $('.lake').append('<div class = redfish id = red_fish' + red_fish_num + '></div>')
    }
  }
  if (weather == "晴天") {
    $('.lake').append('<div class = bluefish id = blue_fish></div>')
  }
  place_fish()
  if (weather == "晴天") {
    $('#red_count').html('<strong># 湖中红鱼的数量:</strong>: ' + red_fish_num)
    $('#blue_count').html('<strong># 湖中蓝鱼的数量:</strong>: 1')
  }
  total_fish_num = red_fish_num + 1
}

function goFish() {
  /* If the subject chooses to goFish, one fish is randomly selected from the lake. If it is red, the trip bank
  is increased by "pay". If it is blue the round ends. If the release rule is "Keep", the fish is also removed
  from the lake. Coded as keycode 36 for jspsych
  */
  if (total_fish_num > 0) {
    if (Math.random() < 1 / (total_fish_num)) {
      $('#blue_fish').remove();
      trip_bank = 0
      $(".lake").html('')
      red_fish_num = 0
      total_fish_num = 0
      last_pay = 0
      round_over = 1
      round_num += 1
      round_over_text = "您钓到了蓝色的鱼！您失去了本轮收集的所有积分。本轮游戏结束。"
    } else {
      if (release == "保留") {
        $('#red_fish' + red_fish_num).remove()

# 钓鱼风险任务配置

以下是钓鱼风险任务的完整配置详情。

```json
[
  {
    "name": "钓鱼风险任务",
    "template": "jspsych",
      "static/js/jspsych/jspsych.js",
      "static/js/jspsych/plugins/jspsych-text.js",
      "static/js/jspsych/poldrack_plugins/jspsych-poldrack-text.js",
      "static/js/jspsych/poldrack_plugins/jspsych-poldrack-instructions.js",
      "static/js/jspsych/poldrack_plugins/jspsych-attention-check.js",
      "static/js/jspsych/poldrack_plugins/jspsych-poldrack-single-stim.js",
      "static/js/jspsych/plugins/jspsych-call-function.js",
      "static/js/jspsych/plugins/jspsych-survey-text.js",
      "static/js/jspsych/poldrack_plugins/jspsych-single-stim-button.js",
      "static/js/utils/poldrack_utils.js",
      "experiment.js",
      "static/css/jspsych.css",
      "static/css/default_style.css",
      "style.css"
    ],
    "exp_id": "angling_risk_task",
    "cognitive_atlas_task_id": "trm_5667488d52ccc",
    "contributors": [
      "Ian Eisenberg",
      "Zeynep Enkavi",
      "Patrick Bissett",
      "Vanessa Sochat",
      "Russell Poldrack"
    ],
    "time": 25,
    "reference": "http://www.ncbi.nlm.nih.gov/pubmed/18194061",
    "publish": true,
    "experiment_variables": [
      {
        "name": "credit_var",
        "type": "credit",
        "datatype": "boolean",
        "description": "如果平均反应时间大于200ms,则为真"
      },
      {
        "name": "performance_var",
        "type": "bonus",
        "datatype": "numeric",
        "description": "积分数量。原始论文将每个积分解释为5美分，并平均支付5美元。"
      }
    ],
    "deployment_variables": {
      "jspsych_init": {
        "fullscreen": true,
        "display_element": "getDisplayElement",
        "on_trial_finish": "addID('钓鱼风险任务')"
      }
    }
  }
]
# 钓鱼风险任务样式

以下是钓鱼风险任务的完整 CSS 样式。

```css
.titlebox {
  width: 35vw;
  height: 8vh;
  position: absolute;
  top: 50%;
  left: 50%;
  margin-right: -50%;
  transform: translate(-50%, -500%);
  border-style: solid;
  border-color: cornflowerblue;
  padding: 0px 10px 0px 10px;
  border-radius: 10px;
}

.buttonbox {
  width: 25vw;
  height: 5vw;
  position: absolute;
  top: 50%;
  left: 50%;
  margin-right: -50%;
  transform: translate(-50%, 340%);
}

.buttonbox select-button:last-child {
  margin-right: 0%;
  /* so the last one doesn't push the div that's giving the space only between the inputs */
}

.select-button {
  width: 46%;
  height: 100%;
  font-size: 22px;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  padding: 12px 20px 12px 20px;
  color: white;
  background-color: cornflowerblue;
  cursor: pointer;
  line-height: 1.4;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  background-image: none;
  border: 1px solid transparent;
  border-radius: 4px;
  margin-right: 4%;
}

.select-button:hover {
  border-color: #999;
  background-color: darkblue;
}

.select-button:active {
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.5) inset, 0px -2px 20px white, 0px 1px 5px rgba(0, 0, 0, 0.1), 0px 2px 10px rgba(0, 0, 0, 0.1);
  background: -webkit-linear-gradient(top, #d1d1d1 0%, #ECECEC 100%);
}

.infocontainer {
  width: 45vw;
  height: 10vw;
  position: absolute;
  top: 50%;
  left: 50%;
  margin-right: -50%;
  transform: translate(-50%, 55%);
}

.subinfocontainer {
  width: 33%;
  height: 100%;
  float: left;
}

.subimgcontainer {
  width: 34%;
  height: 100%;
  float: left;
}

.infobox {
  width: 100%;
  height: 40%;
  margin-bottom: 10px;
  float: left;
  border-style: solid;
  border-color: cornflowerblue;
  padding: 0px 10px 0px 10px;
  border-radius: 10px;
}

.infotext {
  text-align: justify;
  font-size: 16px;
}

.imgbox {
  width: 100%;
  height: 100%;
  float: left;
  background: url('images/fish_icon.png') no-repeat;
  background-size: contain;
  margin-left: 10%;
}

.lake {
  width: 60vw;
  height: 40vh;
  position: absolute;
  top: 50%;
  left: 50%;
  margin-right: -50%;
  transform: translate(-50%, -80%);
  border-style: solid;
  border-color: cornflowerblue;
  background-color: LightBlue;
  border-radius: 10px;
}

.cooler {
  width: 13vw;
  height: 5vw;
  position: absolute;
  top: 50%;
  left: 50%;
  margin-right: -50%;
  transform: translate(235%, -80%);
  border-style: solid;
  border-color: cornflowerblue;
  border-radius: 10px;
}

.weatherbox {
  width: 13vw;
  height: 10vw;
  position: absolute;
  top: 50%;
  left: 50%;
  margin-right: -50%;
  transform: translate(235%, -155%);
  border-style: solid;
  border-color: cornflowerblue;
  border-radius: 10px;
}

.redfish {
  background: url('images/red_fish.png');
  background-size: contain;
  width: 2vw;
  height: 1.4vw;
}

.bluefish {
  background: url('images/blue_fish.png');
  background-size: contain;
  width: 2vw;
  height: 1.4vw;
}

.greyfish {
  background: url('images/grey_fish.png');
  background-size: contain;
  width: 2vw;
  height: 1.4vw;
}
