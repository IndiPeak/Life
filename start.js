const { ipcRenderer } = require('electron/renderer')
const { app } = require('electron')
const fs = require('node:fs')
const os = require('os')
const path = require('node:path')
const { setInterval } = require('node:timers/promises')

const folderPath = os.homedir + '/OwnLifeData'

if (!fs.existsSync(folderPath)) {
	fs.mkdirSync(folderPath)
}

const dataPath = path.join(folderPath, 'data.dt')

document.addEventListener('DOMContentLoaded', () => {
	if (!fs.existsSync(dataPath)) {
		const yearButtons = document.querySelectorAll(".year")
		const apply = document.querySelector(".apply")
		
		let choosenYear 
	
		for (let year of yearButtons) {
			year.addEventListener('click', () => {
				if (year != choosenYear) {
					choosenYear = year
					SetChoosenColors(year)
		
					apply.style.animation = "show .3s forwards"
	
					for (let y of yearButtons) {
						if (y != year) {
							UnsetChoosenColors(y)
						}
					}
				}
			})
		}
	
		function SetChoosenColors(year) {
			year.style.backgroundColor = "#a6a6a6"
			year.style.color = "#0D0D0D"
			year.style.fontWeight = 500
			year.style.transform = "scaleX(1.02)"
		}
	
		function UnsetChoosenColors(year) {
			year.style.backgroundColor = "#0D0D0D"
			year.style.color = "#A6A6A6"
			year.style.fontWeight = 400
			year.style.transform = "scaleX(1)"
		}
	
		if (apply) {
			apply.addEventListener('click', () => {
				fs.writeFile(dataPath, choosenYear.textContent, err => {
					if (err) console.log(err)
				})
		
				document.querySelector(".app").style.animation = "hide .3s forwards"
				setTimeout(() => {
					apply.removeEventListener('click', this)
					ipcRenderer.send('loadHTML', 'main.html')
				}, 310)
			})
		}
	}
	else {
		const date = new Date()
		const currentYear = date.getFullYear()
		const currentMonthDays = new Date(currentYear, date.getMonth(), 0).getDate()

		document.querySelector('.app').style.animation = "show .5s forwards"

		let userYear
		try {
			userYear = fs.readFileSync(dataPath, 'utf-8')
		} catch(err) {
			console.log(err)
		}

		const tb_year = document.getElementById('tb_year')
		document.querySelector('.currentYear').textContent = currentYear
		document.querySelector('.currentMonth').textContent = date.toLocaleString('eng' , { month: 'long'})
		SetTbActiveStyles(tb_year)

		const yearContents = document.querySelector('.yearContents')
		const monthContents = document.querySelector('.monthContents')
		const dayContents = document.querySelector('.dayContents')

		let activeContents

		// const allContents = document.querySelectorAll("#content")
		const all_tb = document.querySelectorAll('.topButton')

		UpdateAllSection()
		UpdateMonthes()
		activeContents = yearContents

		for (let tb of all_tb) {
			tb.addEventListener('click', () => {
				SetTbActiveStyles(tb)

				for (let tb_into of all_tb) {
					if (tb_into != tb) {
						UnsetTbActiveStyles(tb_into)
						
					}
				}

				if (tb.id == "tb_year") {
					UpdateMonthes()
					ShowViewContents(yearContents)
				}
				else if (tb.id == "tb_month") {
					UpdateDays()
					ShowViewContents(monthContents)
				}
				else{
					UpdateHours()
					ShowViewContents(dayContents)
				}
			})
		}


		const resizer = document.querySelector('.resizer')
		const sidePanel = document.querySelector('.sidePanel')
		let isResizing = false

		resizer.addEventListener('mouseenter', () => {
			ResizerActive()
		})

		resizer.addEventListener('mouseleave', () => {
			if (!isResizing) {
				ResizerDisable()
			}
		})

		resizer.addEventListener('mousedown', (e) => {
			isResizing = true
			document.addEventListener('mousemove', resizeSidebar)
			document.addEventListener('mouseup', stopResize)
		})

		function UpdateAllSection() {
			let fullYears = currentYear - userYear

			if (fullYears > 100) fullYears = 100

			const quads = document.querySelectorAll('.quad')

			for (let i = 0; i < fullYears; i++) {
				setTimeout(() => {
					FillQuad(quads[i])
				}, 10*i)
			}

			const info = document.querySelector('.info')

			info.textContent = 'You was filled ' + fullYears + ' of all.'
		}

		function UpdateMonthes() {
			const step = 2
			const monthes = document.querySelectorAll('.month')

			for (let i = 0; i < 12; i++){
				const dat = new Date(currentYear, i, 0)
				let days = dat.getDate()

				monthes[i].style.width = days * step + 'vw'

				let txt = dat.toLocaleString('eng' , { month: 'long'})
				monthes[i].textContent = txt
				
				if (i < date.getMonth() + 1) {
					monthes[i].style.background = "linear-gradient(to right, var(--text) 100%, transparent 0)"
				}
				else if (i == date.getMonth() + 1) {
					let fill = step * date.getDate()
					monthes[i].style.background = "linear-gradient(to right, var(--text) " + fill + "%, transparent 0)"

					let windowWidth = window.innerWidth
					let txtPiece = (100 * (10 + txt.length)) / windowWidth

					if (txtPiece > fill) {
						monthes[i].style.color = "#636363"
					}
				}
				else {
					monthes[i].style.color = "#636363"
				}
			}
		}

		function UpdateDays() {
			const daysCont = document.querySelector('.daysCont')
			let currentTime = date.getHours() + (date.getMinutes() / 60)
			console.log(currentTime)
			document.querySelector('.currentDayProgress').style.background = "linear-gradient(to top, var(--text)" + currentTime / 24 * 100 + "%, transparent 0"
			if (daysCont.children.length == 0) {
				const weekday = ["Sun.","Mon.","Tu.","Wed.","Thu.","Fri.","Sat."]
	
				document.querySelector('.dn').textContent = weekday[date.getDay()] + " " + date.getDate()
	
				for (let i = 0; i < currentMonthDays; i++){
					const newDay = document.createElement('div')
					let day = new Date(currentYear, date.getMonth(), i+1).getDay()
	
					if (i == 0) {
						let previousMonthDays
						if (date.getMonth() == 0) {
							previousMonthDays = new Date(currentYear, 11, 0).getDate()
						}
						else {
							previousMonthDays = new Date(currentYear, date.getMonth(), 0).getDate()
						}
						for (let j = 0; j < day; j++) {
							let emptyDay = document.createElement('div')
							emptyDay.className = 'day'
							emptyDay.textContent = previousMonthDays - (day - (j + 1))
							emptyDay.style.color = "#383838"
							emptyDay.style.borderColor = "#1f1f1f" 
							daysCont.appendChild(emptyDay)
						}
					}
	
					newDay.className = 'day'
					newDay.textContent = i + 1
	
					if (i < date.getDate()) {
						newDay.style.backgroundColor = "#a6a6a6"
						newDay.style.color = "#262626"
					}
	
					daysCont.appendChild(newDay)
				}
			}
		}

		function UpdateHours() {
			const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
	
			document.querySelector('.currentDay').textContent = weekday[date.getDay()] + ",   " + date.getDate() 

			let currentTime = date.getHours() + (date.getMinutes() / 60)
			const sun = document.querySelector('.sun')
			let deg = (currentTime / 24 * 100) * 3.6 + 180
			console.log(deg)
			sun.style.transform = "rotate(" + deg + "deg)"
			UpdateSec()
		}
		
		function UpdateSec() {
			let tm = document.querySelector('.tm')
			let dt = new Date()

			let h = addZero(dt.getHours())
			let m = addZero(dt.getMinutes())
			let s = addZero(dt.getSeconds())
			tm.textContent = h + ":" + m + ":" + s

			setTimeout(UpdateSec, 1000)
		}

		function addZero(i) {
			if (i < 10) { i = "0" + i }
			return i
		}

		function ShowViewContents(content) {
			activeContents.style.animation = "hide .1s forwards"
			content.style.animation = "show .1s forwards"

			activeContents = content
		}

		function resizeSidebar(e) {
			if (isResizing) {
				const newWidth = (e.clientX / window.innerWidth) * 100
				sidePanel.style.width = newWidth + 'vw'
				if (newWidth <= 10) {
					resizer.style.marginLeft = 10 + 'vw'
				}
				else if (newWidth >= 95) {
					resizer.style.marginLeft = 95 + 'vw'
				}
				else {
					resizer.style.marginLeft = newWidth + 'vw'
				}
			}
		}

		function stopResize() {
			isResizing = false
			ResizerDisable()
			document.removeEventListener('mousemove', resizeSidebar)
			document.removeEventListener('mouseup', stopResize)
		}

		function ResizerActive() {
			sidePanel.style.borderRightColor = "#8c8c8c"
			sidePanel.style.borderRightWidth = "3px"
		}

		function ResizerDisable () {
			sidePanel.style.borderRightColor = "#383838"
			sidePanel.style.borderRightWidth = "1px"
		}

		function FillQuad(quad) {
			quad.style.backgroundColor = "#a6a6a6"
		}

		function SetTbActiveStyles(tb) {
			tb.style.backgroundColor = "#A6A6A6"
			tb.style.color = "#0D0D0D"
			tb.style.fontWeight = 400
		}

		function UnsetTbActiveStyles(tb) {
			tb.style.backgroundColor = "transparent"
			tb.style.color = "#A6A6A6"
			tb.style.fontWeight = 300
		}
	}
})