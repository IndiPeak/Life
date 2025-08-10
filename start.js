const { ipcRenderer } = require('electron/renderer')
const fs = require('node:fs')
const os = require('os')
const path = require('node:path')

const folderPath = os.homedir + '/OwnLifeData'

if (!fs.existsSync(folderPath)) {
	fs.mkdirSync(folderPath)
}

const dataPath = path.join(folderPath, 'data.dt')

document.addEventListener('DOMContentLoaded', () => {
	if (!fs.existsSync(dataPath)) {
		const scrollBox = document.querySelector('.scrollBox')
		
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
		

		document.querySelector('.app').style.animation = "show .5s forwards"

		let userYear
		try {
			userYear = fs.readFileSync(dataPath, 'utf-8')
		} catch(err) {
			console.log(err)
		}

		const tb_year = document.getElementById('tb_month')
		document.querySelector('.currentYear').textContent = currentYear
		document.querySelector('.currentMonth').textContent = date.toLocaleString('eng' , { month: 'long'})
		SetTbActiveStyles(tb_year)

		const all_tb = document.querySelectorAll('.topButton')

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
				}
			})
		}

		UpdateAllSection()
		UpdateMonthes()

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
				
				if (i < date.getMonth()) {
					monthes[i].style.background = "linear-gradient(to right, var(--think-text) 100%, transparent 0)"
				}
				else if (i == date.getMonth()) {
					let fill = step * date.getDate()
					monthes[i].style.background = "linear-gradient(to right, var(--think-text) " + fill + "%, transparent 0)"

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

		const yearContents = document.querySelector('.yearContents')


		function ShowViewContents(contents) {
			contents.style.animation = "show .4s forwards"

			
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

		function ShowYearContents() {

		}

		function ShowMonthContents() {

		}

		function ShowDayContents() {

		}
	}
})