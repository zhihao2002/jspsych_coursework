// Reference: http://www.ncbi.nlm.nih.gov/pubmed/18193561
// Decision Making and Learning While Taking Sequential Risks. Pleskac 2008

/* ************************************ */
/* Define helper functions */
/* ************************************ */
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
  	credit_var = (missed_percent < 0.4 && avg_rt > 200)
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
	/* Records state of the world before the person made their choice
	 */
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
	/* Records state of the world before the person made their choice
	 */
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
				red_fish_num -= 1
				total_fish_num -= 1
			}
			trip_bank += pay
			last_pay = pay

		}

		lake_state = $('.lake').html()
	}
}

function 收集() {
	round_over = 1
	round_num += 1
	round_over_text = "您在旅行银行中收集到的点数 (" + trip_bank +
		" points) 并将其移动到您的锦标赛库中。"
		// Tranfers points from trip bank to tournament bank and ends the round. Coded as keycode 35 for jspsych
	tournament_bank += trip_bank
	tournment_bank = tournament_bank
	trip_bank = 0
	$(".redfish").remove();
	$(".bluefish").remove();
	$('#tournament_bank').html('<strong>锦标赛银行:</strong> ' + tournament_bank)
	$('#trip_bank').html('<strong>旅行银行(得分):</strong> ' + trip_bank)
	red_fish_num = 0
	total_fish_num = 0
	lake_state = $('.lake').html()
	cooler_state = $('.lake').html()
}



function calc_overlap(a1) {
	// helper function when placing fish. 
	var overlap = 0;
	for (var i = 0; i < filled_areas.length; i++) {
		a2 = filled_areas[i]
			// no intersection cases
		if (a1.x + a1.width < a2.x) {
			continue;
		}
		if (a2.x + a2.width < a1.x) {
			continue;
		}
		if (a1.y + a1.height < a2.y) {
			continue;
		}
		if (a2.y + a2.height < a1.y) {
			continue;
		}

		// intersection exists : calculate it !
		var x1 = Math.max(a1.x, a2.x);
		var y1 = Math.max(a1.y, a2.y);
		var x2 = Math.min(a1.x + a1.width, a2.x + a2.width);
		var y2 = Math.min(a1.y + a1.height, a2.y + a2.height);

		var intersection = ((x1 - x2) * (y1 - y2));

		overlap += intersection;

	}
	return overlap;
}

function place_fish() {
	/* Places fish in the lake and attempts to overlap them as little as possible. It does this by randomly placing the fish
	   up to maxSearchIterations times. It stops if it places the fish with no overlap. Otherwise, the fish goes where there is the
	   least overlap. 
	*/
	var index = 0;
	fish_types = ['redfish', 'bluefish', 'greyfish']
	for (f = 0; f < fish_types.length; f++) {
		fish = fish_types[f]
		$('.' + fish).each(function(index) {
			var rand_x = 10;
			var rand_y = 10;
			var smallest_overlap = '';
			var best_choice;
			var area;
			for (var i = 0; i < maxSearchIterations; i++) {
				rand_x = Math.round(min_x + ((max_x - min_x) * (Math.random())));
				rand_y = Math.round(min_y + ((max_y - min_y) * (Math.random())));
				area = {
					x: rand_x,
					y: rand_y,
					width: $(this).width(),
					height: $(this).height()
				};
				var overlap = calc_overlap(area);
				if (smallest_overlap === '') {
					smallest_overlap = overlap
					best_choice = area
				} else if (overlap < smallest_overlap) {
					smallest_overlap = overlap;
					best_choice = area;
				}
				if (overlap === 0) {
					break;
				}
			}

			filled_areas.push(best_choice)
			$(this).css({
				position: "absolute",
				"z-index": index++
			});

			$(this).css({
				left: rand_x,
				top: rand_y
			});
		});
	}
}


/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var run_attention_checks = false
var attention_check_thresh = 0.45
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds
var credit_var = true
var performance_var = 0

// task specific variables
var num_practice_rounds = 2
var num_rounds = 30
var red_fish_num = 0
var total_fish_num = 0
var start_fish_num = 0
var trip_bank = 0
var tournament_bank = 0
var total_points = 0 // used to determine bonus pay
	//each block defines the weather and release law
var blocks = [{
	weather: "晴天",
	release: "释放"
}, {
	weather: "晴天",
	release: "保留"
}, {
	weather: "多云",
	release: "释放"
}, {
	weather: "多云",
	release: "保留"
}]
var exp_stage = 'practice'
var practiceblocks = jsPsych.randomization.shuffle(blocks)
var blocks = jsPsych.randomization.shuffle(blocks)
var pay = 1 //payment for one red fish
var last_pay = 0 //variable to hold the last amount of points received
var lake_state = '' //variable for redrawing the board from trial to trial
var trial_num = 0 // global variable to track the number of trials into a round
var round_num = 0 // global variable to track the number of rounds into a tournament
var round_over = 0 //equals 1 if a blue fish is caught or the participant 'collects'
var round_over_text = '' 

//Variables for placing fish
var maxSearchIterations = 100;
var min_x = 0
var max_x = 0
var min_y = 0
var max_y = 0
var filled_areas = [];

var game_setup = "<div class = titlebox><div class = center-text>捕获或</div></div>" +
	"<div class = lake></div>" +
	"<div class = cooler><p class = info-text>&nbsp<strong>储存的红鱼: </strong></p></div>" +
	"<div class = weatherbox><div class = center-text id = weathertext></div></div>" +
	"<div class = infocontainer>" +
	"<div class = subinfocontainer>" +
	"<div class = infobox><p class = info-text id = red_count>&nbsp<strong># 湖中红鱼的数量: </strong></p></div>" +
	"<div class = infobox><p class = info-text id = blue_count>&nbsp<strong># 湖中蓝鱼的数量: </strong></p></div>" +
	"</div>" +
	"<div class = subimgcontainer>" +
	"<div class = imgbox></div>" +
	"</div>" +
	"<div class = subinfocontainer>" +
	"<div class = infobox><p class = info-text id = trip_bank><strong>旅行银行(得分): </strong></p></div> " +
	"<div class = infobox><p class = info-text id = tournament_bank><strong>锦标赛银行: </strong></p></div>" +
	"</div>" +
	"</div>" +
	"<div class = buttonbox><button id = 'goFish' class = select-button onclick = goFish()>钓鱼</button><button id = '收集' class = select-button onclick = 收集()>收集</button></div>"
	/* ************************************ */
	/* Set up jsPsych blocks */
	/* ************************************ */
	// Set up attention check node
var attention_check_block = {
	type: 'attention-check',
	timing_response: 180000,
	response_ends_trial: true,
	timing_post_trial: 200
}

var attention_node = {
	timeline: [attention_check_block],
	conditional_function: function() {
		return run_attention_checks
	}
}

//Set up post task questionnaire
var post_task_block = {
   type: 'survey-text',
   data: {
       exp_id: "angling_risk_task",
       trial_id: "post task questions"
   },
   questions: ['<p class = center-block-text style = "font-size: 20px">请您总结以下，这项任务要求你做什么？</p>',
              '<p class = center-block-text style = "font-size: 20px">您对这项任务有什么意见或建议吗？</p>'],
   rows: [15, 15],
   columns: [60,60]
};

/* define static blocks */
var feedback_instruct_text =
	'欢迎参加本次实验，本实验大约需要25分钟，请按<strong>enter</strong>键开始实验。'
var feedback_instruct_block = {
	type: 'poldrack-text',
	cont_key: [13],
	data: {
		trial_id: 'instruction'
	},
	text: getInstructFeedback,
	timing_post_trial: 0,
	timing_response: 180000
};
/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var instructions_block = {
	type: 'poldrack-instructions',
	pages: [
		'<div class = centerbox><p class = block-text>在这项任务中，您将参加一场钓鱼比赛。在比赛中，您将进行多轮捕鱼游戏。每轮比赛中，您都会看到一个有很多鱼的湖。您的目标是捕获尽可能多的鱼。</p><p class = block-text>在屏幕上，您会看到一个湖和两个按钮：“钓鱼”和“收集”。如果您按“钓鱼”，您将随机捕获湖中的一条鱼。每条鱼的可能性都相同。</p><p class = block-text>湖中有许多红鱼和一条蓝鱼。每捕获一条红鱼，您就可以在该轮的“旅程银行”中获得1分，然后您可以“收集”这些分数，将其转入您的“锦标赛银行”，开始新的一轮。但是，如果您钓到了蓝鱼，这一轮将结束，您将失去该轮获得的所有积分。</p><p class = block-text>为了在一轮又一轮中保持积分，您必须在钓到蓝鱼之前停止钓鱼并按下 “收集 ”键。</p><p class = block-text>当您阅读完以上指导语后，请点击下方的“开始练习”按钮，您将进行' + num_practice_rounds + '轮捕鱼游戏练习。</p></div>'
	],
	allow_keys: false,
	data: {
		trial_id: 'instruction'
	},
	show_clickable_nav: true,
	timing_post_trial: 1000
};

var instruction_node = {
	timeline: [feedback_instruct_block, instructions_block],
	/* This function defines stopping criteria */
	loop_function: function(data) {
		for (i = 0; i < data.length; i++) {
			if ((data[i].trial_type == 'poldrack-instructions') && (data[i].rt != -1)) {
				rt = data[i].rt
				sumInstructTime = sumInstructTime + rt
			}
		}
		if (sumInstructTime <= instructTimeThresh * 1000) {
			feedback_instruct_text =
				'Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  按<strong>enter</strong> 键继续。'
			return true
		} else if (sumInstructTime > instructTimeThresh * 1000) {
			feedback_instruct_text = 'Done with instructions. 按<strong>enter</strong> 键继续。'
			return false
		}
	}
}

var conditions_instructions_block = {
	type: 'poldrack-instructions',
	pages: [
		'<div class = centerbox><p class = block-text><p class = block-text>您将参加四场比赛，每场比赛都有不同的规则。比赛的一个不同之处在于您是保留还是释放捕获的鱼。在<span style="color:red">捕获后释放</span>条件下，您将一直释放您刚刚捕获的鱼，因此在整个回合中，红鱼和蓝鱼的数量将保持不变。</p><p class = block-text>在<span style="color:red">捕获并保留</span>条件下，您钓到的鱼就会从湖里出来，进入你的储存箱。因此，每次钓到红鱼时，钓到蓝鱼的几率就会增加。</p></div>',
		'<div class = centerbox><p class = block-text>不同比赛的<span style="color:blue">天气</span>也会有所不同。当天气为<span style="color:blue">晴天</span>时，您可以看到湖里有多少鱼。湖面下也会有计数器，告诉您湖里还有多少红鱼和蓝鱼。</p><p class = block-text>当天气为<span style="color:blue">多云</span>时，湖水浑浊，看不到鱼。计数器也将是空白的。不过，保留或释放规则仍然适用。如果您在<span style="color:red">捕获后释放</span>模式下，每次 “钓鱼 ”之后，湖中鱼的数量都保持不变。如果您在<span style="color:red">捕获并保留</span>模式下，鱼会从湖中游出</p></div>',
		'<div class = centerbox><p class = block-text>您将在每种<span style="color:blue">天气</span> (晴天 or 多云)和<span style="color:red">释放</span> (释放 or 保留)规则组合下进行一场比赛。每场比赛都是独立的。您在一场比赛中获得的分数不会影响下一场比赛。您的目标是在所有四场比赛中取得尽可能好的成绩。</p><p class = block-text>您可以通过出色完成任务来获得奖金，因此请尽最大努力使您的收入最大化！您的奖金将与您的收入成正比。</p></div>',
		'<div class = centerbox><p class = block-text>在比赛开始前，四场比赛中的每场比赛都会有一个简短的练习环节。在每次练习赛开始前，您将选择湖中鱼的数量（1-200 条）。在正式实验中，您将无法选择鱼的数量。</p></div>'
	],
	allow_keys: false,
	data: {
		trial_id: 'instruction'
	},
	show_clickable_nav: true,
	timing_post_trial: 1000
};

var end_block = {
	type: 'poldrack-text',
	text: '<div class = centerbox><p class = center-block-text>感谢您参与并完成这项实验！</p><p class = center-block-text>按<strong>enter</strong> 键开始。</p></div>',
	cont_key: [13],
	data: {
		trial_id: "end",
    	exp_id: 'angling_risk_task'
	},
	timing_response: 180000,
	timing_post_trial: 0,
	on_finish: assessPerformance
};

var round_over_block = {
	type: 'poldrack-text',
	text: getRoundOverText,
	cont_key: [13],
	timing_response: 180000,
	data: {
		trial_id: "round_over"
	},
	timing_post_trial: 0,
	on_finish: function() {
		caught_blue = false
		if (round_over_text.indexOf('You caught the blue fish!') != -1) {
			caught_blue = true
		}
		jsPsych.data.addDataToLastTrial({
			exp_stage: exp_stage,
			caught_blue: caught_blue,
			weather: weather,
			release: release
		})
	},
};

var update_performance_var_block = {
	type: 'call-function',
	data: {
		trial_id: 'update_performance_var'
	},
	func: function() {
		total_points += tournament_bank
	}
}

var ask_fish_block = {
	type: 'survey-text',
	on_finish: function() {
		jsPsych.data.addDataToLastTrial({
			exp_stage: exp_stage
		})
	},
	data: {
		trial_id: "ask fish"
	},
	questions: [
		[
			"<p class = center-block-text>本次比赛，湖中会有多少条红鱼呢？请输入 1-200 之间的数字。</p><p class = center-block-text>如果您没有输入，或者输入的数值超出了这个范围，红鱼的数量将在 1-200 之间随机设定。</p>"
		]
	],
}

var set_fish_block = {
	type: 'call-function',
	on_finish: function() {
		jsPsych.data.addDataToLastTrial({
			exp_stage: exp_stage
		})
	},
	data: {
		trial_id: "set_fish"
	},
	func: function() {
		var last_data = jsPsych.data.getData().slice(-1)[0]
		var last_response = parseInt(last_data.responses.slice(7, 10))
		start_fish_num = last_response + 1
		if (isNaN(start_fish_num) || start_fish_num >= 200 || start_fish_num < 0) {
			start_fish_num = Math.floor(Math.random() * 200) + 1
		}
	},
	timing_post_trial: 0,
}

var practice_block = {
	type: 'single-stim-button',
	stimulus: getGame,
	button_class: 'select-button',
	data: get_practice_data,
	timing_post_trial: 0,
	on_finish: function() {
		jsPsych.data.addDataToLastTrial({
			'pay_on_trial': last_pay
		})
	}
};


var practice_node = {
	timeline: [practice_block],
	loop_function: function(data) {
		if (round_over == 1) {
			return false
		} else {
			return true
		}
	}
}

var game_block = {
	type: 'single-stim-button',
	stimulus: getGame,
	button_class: 'select-button',
	data: get_data,
	timing_post_trial: 0,
	on_finish: function() {
		jsPsych.data.addDataToLastTrial({
			'pay_on_trial': last_pay
		})
	}
};

var game_node = {
	timeline: [game_block],
	loop_function: function(data) {
		if (round_over == 1) {
			return false
		} else {
			return true
		}
	}
}

var start_test_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "test_intro"
	},
	timing_response: 180000,
	text: '<div class = centerbox><p class = center-block-text>练习结束！现在正式开始锦标赛。一共有四场比赛，每场 30 回合。</p><p class = center-block-text>按<strong>enter</strong>键开始比赛。</p></div>',
	cont_key: [13],
	timing_post_trial: 1000,
	on_finish: function() {
		tournament_bank = 0
		exp_stage = 'test'
	}
};

//Setup task
angling_risk_task_experiment = []
angling_risk_task_experiment.push(instruction_node)
//Practice basic layout
weather = "晴天"
release = "保留"
weather_rule = "您可以看到湖里有多少鱼"
release_rule = "钓到的鱼会从湖里出来"
var tournament_intro_block_practice = {
	type: 'poldrack-text',
	text: '<div class = centerbox><p class = block-text>现在您将开始一场锦标赛。如果天气是<span style="color:blue">' +
		weather + '</span>,这意味着' + weather_rule +
		'。如果放生规则为<span style="color:red">' + release + '</span>,这意味着' +
		release_rule +
		'。</p><p class = center-block-text>请按<strong>enter</strong>键开始。</p></div>',
	cont_key: [13],
	timing_response: 180000,
	data: {
		weather: weather,
		release: release,
		exp_stage: "practice",
		trial_id: "intro"
	},
	on_finish: function(data) {
		weather = data.weather
		release = data.release
		tournament_bank = 0
		round_num = 0
	}
}
angling_risk_task_experiment.push(tournament_intro_block_practice)
angling_risk_task_experiment.push(ask_fish_block)
angling_risk_task_experiment.push(set_fish_block)
for (i = 0; i < num_practice_rounds; i++) {
	angling_risk_task_experiment.push(practice_node)
	angling_risk_task_experiment.push(round_over_block)
}



angling_risk_task_experiment.push(conditions_instructions_block)
//practice each condition
for (b = 0; b < practiceblocks.length; b++) {
	block = practiceblocks[b]
	weather = block.weather
	release = block.release
	if (weather == "晴天") {
		weather_rule = "你可以看到湖里有多少鱼"
	} else {
		weather_rule = "你看不到湖里有多少鱼"
	}
	if (release == "保留") {
		release_rule = "你捕到的鱼从湖里出来"
	} else {
		release_rule = "湖中鱼的数量保持不变"
	}
	var tournament_intro_block_practice = {
		type: 'poldrack-text',
		text: '<div class = centerbox><p class = block-text>现在您将开始一场锦标赛。如果天气是<span style="color:blue">' +
			weather + '</span> 这意味着' + weather_rule +
			'. 如果释放规则是<span style="color:red">' + release + '</span>, 这意味着' +
			release_rule +
			'.</p><p class = center-block-text>按<strong>enter</strong> 键开始。</p></div>',
		cont_key: [13],
		timing_response: 180000,
		data: {
			weather: weather,
			release: release,
			exp_stage: "practice",
			trial_id: "intro"
		},
		on_finish: function(data) {
			weather = data.weather
			release = data.release
			tournament_bank = 0
			round_num = 0
		}
	}
	angling_risk_task_experiment.push(tournament_intro_block_practice)
	angling_risk_task_experiment.push(ask_fish_block)
	angling_risk_task_experiment.push(set_fish_block)
	for (i = 0; i < num_practice_rounds; i++) {
		angling_risk_task_experiment.push(practice_node)
		angling_risk_task_experiment.push(round_over_block)
	}
}

angling_risk_task_experiment.push(start_test_block)
for (b = 0; b < blocks.length; b++) {
	block = blocks[b]
	weather = block.weather
	release = block.release
	if (weather == "晴天") {
		weather_rule = "你可以看到湖里有多少鱼"
	} else {
		weather_rule = "你看不到湖里有多少鱼"
	}
	if (release == "保留") {
		start_fish_num = 128
		release_rule = "你捕到的鱼从湖里出来"
	} else {
		start_fish_num = 65
		release_rule = "湖中鱼的数量保持不变"
	}
	var tournament_intro_block = {
		type: 'poldrack-text',
		text: '<div class = centerbox><p class = block-text>现在您将开始一场锦标赛。如果天气是<span style="color:blue">' +
			weather + '</span> 这意味着' + weather_rule +
			'. 如果释放规则是<span style="color:red">' + release + '</span>, 这意味着' +
			release_rule +
			'.</p><p class = center-block-text>按<strong>enter</strong> 键开始。</p></div>',
		cont_key: [13],
		timing_response: 120000,
		data: {
			weather: weather,
			release: release,
			start_fish_num: start_fish_num,
			trial_id: "intro",
			exp_stage: "test"
		},
		on_finish: function(data) {
			weather = data.weather
			release = data.release
			start_fish_num = data.start_fish_num
			tournament_bank = 0
			round_num = 0
		}
	}
	angling_risk_task_experiment.push(tournament_intro_block)
	for (i = 0; i < num_rounds; i++) {
		angling_risk_task_experiment.push(game_node)
		angling_risk_task_experiment.push(round_over_block)
	}
	if ($.inArray(b, [0, 2]) != -1) {
		angling_risk_task_experiment.push(attention_node)
	}
	angling_risk_task_experiment.push(update_performance_var_block)
}
angling_risk_task_experiment.push(post_task_block)
angling_risk_task_experiment.push(end_block)