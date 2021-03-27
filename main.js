let LETTERS = [];
let FORMULAS_INPUT = [];
let FORMULAS_OUTPUT = [];
let FORMULAS_CALCULATED = [];

function parseLetters() {
	const rawInputValues = $('#input-values').val().trim();
	inputValues = rawInputValues.split('\n');
	inputValues.forEach(function (inputValue) {
		matches = inputValue.trim().match(/^([a-zA-Z]+) *=? *([0-9]+)$/) // @TODO add support for float
		if (matches) {
			const firstPart = matches[1];
			const secondPart = matches[2];
			if (firstPart.length === 1) {
				LETTERS[firstPart] = parseInt(secondPart);
			} else if (firstPart.length > 1 && firstPart.length === secondPart.length) {
				for (var i = 0; i < firstPart.length; i++) {
					const letter = firstPart.charAt(i);
					LETTERS[letter] = parseInt(secondPart.charAt(i));
				}
			} else {
				console.warn('Unexpected combination of letter and value: "' + inputValue + '"');
			}
		}
	});
}

function parseFormulas() {
	const rawinputFormulas = $('#input-formulas').val().trim();
	FORMULAS_INPUT = rawinputFormulas.split('\n');
	FORMULAS_OUTPUT = [...FORMULAS_INPUT];
	FORMULAS_OUTPUT.forEach(function (formulaOutput, key) {
		// update output formulas
		for (const letter in LETTERS) {
			const letterValue = LETTERS[letter];
			formulaOutput = formulaOutput.replaceAll(letter, letterValue);
		}
		FORMULAS_OUTPUT[key] = formulaOutput;
	});
}

function calculateFormulas() {
	FORMULAS_OUTPUT.forEach(function (formula, formulaKey) {

		i = 0;
		do { // division
			i++;
			if (i > 100) {
				console.log('Too many divisions');
				break;
			}
			matches = [...formula.matchAll(/([0-9]+) *\/ *([0-9]+)/g)];
			matches.forEach(function (match) {
				const firstDigit = parseInt(match[1]);
				const secondDigit = parseInt(match[2]);
				formula = formula.replace(match[0], firstDigit / secondDigit);
			});
		} while (matches.length > 0)

		i = 0;
		do { // multiplication
			i++;
			if (i > 100) {
				console.log('Too many multiplications');
				break;
			}
			matches = [...formula.matchAll(/([0-9]+) *\* *([0-9]+)/g)];
			matches.forEach(function (match) {
				const firstDigit = parseInt(match[1]);
				const secondDigit = parseInt(match[2]);
				formula = formula.replace(match[0], firstDigit * secondDigit);
			});
		} while (matches.length > 0)

		i = 0;
		do { // sum
			matches = [...formula.matchAll(/([0-9]+) *\+ *([0-9]+)/g)];
			i++;
			if (i > 100) {
				console.log('Too many sums');
				break;
			}
			matches.forEach(function (match) {
				const firstDigit = parseInt(match[1]);
				const secondDigit = parseInt(match[2]);
				formula = formula.replace(match[0], firstDigit + secondDigit);
			});
		} while (matches.length > 0)

		i = 0;
		do { // substract
			i++;
			if (i > 100) {
				console.log('Too many substracts');
				break;
			}
			matches = [...formula.matchAll(/([0-9]+) *- *([0-9]+)/g)];
			matches.forEach(function (match) {
				const firstDigit = parseInt(match[1]);
				const secondDigit = parseInt(match[2]);
				formula = formula.replace(match[0], firstDigit - secondDigit);
			});
		} while (matches.length > 0)


		// remove parenthess
		formula = formula.replaceAll('(', '');
		formula = formula.replaceAll(')', '');

		FORMULAS_CALCULATED[formulaKey] = formula;
	});
}

function renderLetters() {
	let lettersHtml = '';
	for (const letter in LETTERS) {
		const letterValue = LETTERS[letter];
		lettersHtml += '<b>' + letter + '</b> = <b>' + letterValue + '</b><br>';
	}
	$('#detected-input-values').html(lettersHtml);
}

function renderFormulas() {
	let formulasHtml = '';
	for (formulaKey = 0; formulaKey < FORMULAS_INPUT.length; formulaKey++) {
		const formulaInput = FORMULAS_INPUT[formulaKey];
		const formulaOutput = FORMULAS_OUTPUT[formulaKey];
		const formulaCalculated = FORMULAS_CALCULATED[formulaKey];

		formulasHtml += '<p>'
		formulasHtml += '<b>' + formulaInput + '</b><br>'
		formulasHtml += '<b>' + formulaOutput + '</b><br>'
		formulasHtml += '<b>' + formulaCalculated + '</b>';
		formulasHtml += '</p>'
	}
	$('#detected-formulas').html(formulasHtml);
}

function run() {
	LETTERS = {};
	FORMULAS_INPUT.length = 0;
	FORMULAS_OUTPUT.length = 0;
	FORMULAS_CALCULATED.length = 0;

	parseLetters();
	parseFormulas();

	calculateFormulas();

	renderLetters();
	renderFormulas();

	saveForm();
}

function saveForm() {
	const savedValues = $('#input-values').val();
	if (savedValues) {
		localStorage.setItem('values', savedValues);
	}
	const savedFormulas = $('#input-formulas').val();
	if (savedFormulas) {
		localStorage.setItem('formulas', savedFormulas);
	}
}

function loadForm() {
	const initialValues = localStorage.getItem('values');
	if (initialValues) {
		$('#input-values').val(initialValues);
	}
	const initialFormulas = localStorage.getItem('formulas');
	if (initialFormulas) {
		$('#input-formulas').val(initialFormulas);
	}
}

$(function () {
	loadForm();
	run();
	$('#form-calculator').on('change', function (event) {
		run();
	}).on('keyup', 'textarea', function (event) {
		run();
	});
});
