if (!Element.prototype.matches) {
	Element.prototype.matches = Element.prototype.msMatchesSelector
		|| Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
	Element.prototype.closest = function (s) {
		let el = this;
		if (!document.documentElement.contains(el)) return null;
		do {
			if (el.matches(s)) return el;
			el = el.parentElement || el.parentNode;
		} while (el !== null && el.nodeType === 1);
		return null;
	};
}

const SearchWithGoogleInstead = (function () {
	const searchField = document.querySelector('form input');

	const styleDuckDuckGo = `<style>
		.searchWithGoogleInstead {
			position: absolute;
			-webkit-appearance: none;
			font-size: 11px;
			padding: 0;
			border: 1px solid rgba(103, 103, 103, 0.3);
			border-radius: 3px;
			cursor: pointer;
			top: 0;
			right: -59px;
			z-index: 10;
			width: 45px;
			height: 44px;
			background: #1990EA;
			padding: 10px;
		}
		.searchWithGoogleInstead:hover {
			background: #F04D44;
		}
		.searchWithGoogleInstead img {
			max-width: 100%;
		}
		.searchWithGoogleInstead__copy {
			display: none;
		}
	@media only screen and (max-width: 740px) {
		.searchWithGoogleInstead {
			position: static;
			display: flex;
			justify-content: center;
			width: 100%;
			margin-top: 5px;
			color: #ffffff;
			font-weight: bold;
		}		
			.searchWithGoogleInstead__copy {
				display: inline-block;
				margin-right: 1em;
				font-size: 2em;
			}
			.searchWithGoogleInstead img {
				max-width: 100%;
				max-height: 25px;
			}
	}
	@media only screen and (max-width: 520px) {
		.searchWithGoogleInstead__copy {
			display: none;
		}
	}
		</style>`;

	const styleBing = `<style>
		.searchWithGoogleInstead { 
			position: absolute;
			-webkit-appearance: none;
			font-size: 11px;
			border: 1px solid rgba(103, 103, 103, 0.3);
			border-radius: 1px;
			cursor: pointer;
			top: 0;
			right: -59px;
			z-index: 10;
			width: 42px;
			height: 41px;
			background: #1990EA;
			padding: 10px;
			transition: background 200ms ease;
		}
		.searchWithGoogleInstead:hover {
			background: #F04D44;
		}
		.searchWithGoogleInstead img {
			max-width: 100%;
		}
		.searchWithGoogleInstead__copy {
			display: none;
		}
	@media only screen and (max-width: 740px) {
		.searchWithGoogleInstead {
			position: static;
			display: flex;
			justify-content: center;
			width: 100%;
			margin-top: 5px;
			color: #ffffff;
			font-weight: bold;
		}		
			.searchWithGoogleInstead__copy {
				display: inline-block;
				margin-right: 1em;
				font-size: 2em;
			}
			.searchWithGoogleInstead img {
				max-width: 100%;
				max-height: 25px;
			}
	}
	@media only screen and (max-width: 520px) {
		.searchWithGoogleInstead__copy {
			display: none;
		}
	}
		</style>`;

	const publicAPI = {};

	const getEngineType = function (url) {
		if (url.indexOf('duckduckgo') > -1) {
			return 'duckduckgo';
		} if (url.indexOf('bing') > -1) {
			return 'bing';
		}
	};

	const buildButtonHTML = function () {
		return `<button class="searchWithGoogleInstead">
			<span class="searchWithGoogleInstead__copy">Search with Google instead</span>
			<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAABCZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIgogICAgICAgICAgICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgICAgICAgICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyI+CiAgICAgICAgIDx0aWZmOlJlc29sdXRpb25Vbml0PjI8L3RpZmY6UmVzb2x1dGlvblVuaXQ+CiAgICAgICAgIDx0aWZmOkNvbXByZXNzaW9uPjU8L3RpZmY6Q29tcHJlc3Npb24+CiAgICAgICAgIDx0aWZmOlhSZXNvbHV0aW9uPjcyPC90aWZmOlhSZXNvbHV0aW9uPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICAgICA8dGlmZjpZUmVzb2x1dGlvbj43MjwvdGlmZjpZUmVzb2x1dGlvbj4KICAgICAgICAgPGV4aWY6UGl4ZWxYRGltZW5zaW9uPjEwMDwvZXhpZjpQaXhlbFhEaW1lbnNpb24+CiAgICAgICAgIDxleGlmOkNvbG9yU3BhY2U+MTwvZXhpZjpDb2xvclNwYWNlPgogICAgICAgICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+MTAwPC9leGlmOlBpeGVsWURpbWVuc2lvbj4KICAgICAg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">
			</button>`;
	};

const insertButtonHTML = function (buttonHTML) {
	searchField.closest('div').style.position = 'relative';
	searchField.closest('div').insertAdjacentHTML('beforeend', buttonHTML);
};

const insertStyles = function (engineName) {
	const styles = engineName === 'duckduckgo' ? styleDuckDuckGo : styleBing;
	searchField.closest('div').insertAdjacentHTML('beforeend', styles);
};

const clickEvent = function (event) {
	event.preventDefault();
	if (event.target.closest('.searchWithGoogleInstead')) {
		window.location.href = `https://www.google.com/search?q=${searchField.value}`;
	}
};

publicAPI.init = function () {
	const engineName = getEngineType(window.location.href);
	const buttonHTML = buildButtonHTML();
	insertStyles(engineName);
	insertButtonHTML(buttonHTML);
	document.addEventListener('click', clickEvent);
};

return publicAPI;
}());

SearchWithGoogleInstead.init();
