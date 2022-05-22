const url = 'http://localhost:5000'
let interval = null
let timerInterval = null
let working = false
let count = 0

window.onload = async function () {



    const registerForm = document.querySelector('#register-form')
    const confirmForm = document.querySelector('#confirm-form')
    const passForm = document.querySelector('#password-form')
    const messageForm = document.querySelector('#message-form')

    const registerLoader = document.querySelector('#register-loader')
    const confirmLoader = document.querySelector('#confirm-loader')
    const passLoader = document.querySelector('#password-loader')
    const messageLoader = document.querySelector('#message-loader')

    const stopButton = document.querySelector('#stop-message')

    const deregisterBtn = document.querySelector('#deregister-button')

    const stats = document.querySelector('#stats')
    stats.querySelector('#count').innerHTML = count


    if (!localStorage.getItem('tims')) {
        localStorage.setItem('tims', JSON.stringify({
            form: {
                step: 'register'
            }
        }))
    }

    // FORM UI CONTROLLER
    formUiController()


    // FIRST STEP
    // TELEGRAM APP REGISTRATION
    registerForm.addEventListener('submit', async function (event) {
        const ld = JSON.parse(localStorage.getItem('tims'))
        cssClassChecker(registerLoader, ['show'], [true])
        cssClassChecker(registerForm, ['no-show'], [true])
        event.preventDefault()

        const request = await requestAPI(url + '/register', 'post', getFormDataAndReturnJSON(event.target))
        if (request) {
            localStorage.setItem('tims', JSON.stringify({
                ...ld,
                form: {
                    ...ld.form,
                    step: 'confirm'
                },
                data: request.data
            }))
        }
        formUiController()

        cssClassChecker(registerLoader, ['show'], [false])
        cssClassChecker(registerForm, ['no-show'], [false])

    })


    // SECOND STEP 
    // CONFIRM
    confirmForm.addEventListener('submit', async function (event) {
        event.preventDefault()
        const ld = JSON.parse(localStorage.getItem('tims'))
        cssClassChecker(confirmLoader, ['show'], [true])
        cssClassChecker(confirmForm, ['no-show'], [true])

        const data = {
            ...ld.data,
            ...getFormDataAndReturnJSON(event.target)
        }

        const request = await requestAPI(url + '/confirm/code', 'post', data)
        if (request && !request.required) {
            localStorage.setItem('tims', JSON.stringify({
                ...ld,
                form: {
                    ...ld.form,
                    step: 'messaging'
                },
                data: request.data
            }))
        }
        else if (request && request.required) {
            localStorage.setItem('tims', JSON.stringify({
                ...ld,
                form: {
                    ...ld.form,
                    step: 'password'
                },
                data: request.data
            }))
        }
        formUiController()

        cssClassChecker(confirmLoader, ['show'], [false])
        cssClassChecker(confirmForm, ['no-show'], [false])
    })


    // PASSWORD
    passForm.addEventListener('submit', async function (event) {
        event.preventDefault()
        const ld = JSON.parse(localStorage.getItem('tims'))
        cssClassChecker(passLoader, ['show'], [true])
        cssClassChecker(passForm, ['no-show'], [true])

        const data = {
            ...ld.data,
            ...getFormDataAndReturnJSON(event.target)
        }

        const request = await requestAPI(url + '/confirm/password', 'post', data)
        if (request) {
            localStorage.setItem('tims', JSON.stringify({
                ...ld,
                form: {
                    ...ld.form,
                    step: 'messaging'
                },
                data: request.data
            }))
        }
        formUiController()
        cssClassChecker(passLoader, ['show'], [false])
        cssClassChecker(passForm, ['no-show'], [false])
    })



    // MESSAGING
    messageForm.addEventListener('submit', async function (event) {
        const ld = JSON.parse(localStorage.getItem('tims'))
        event.preventDefault()

        const formData = getFormDataAndReturnJSON(event.target)
        const data = {
            ...ld.data,
            ...formData,
            channels: formData.channels.split('@')
        }


        working = true
        formUiController()

        const request = await requestAPI(url + '/message', 'post', data)
        setStats(request)

        // loop
        interval = setInterval(async function () {
            const request = await requestAPI(url + '/message', 'post', data)
            setStats(request)
        }, +formData.interval * 60000)


    })


    // DEREGISTER TELEGRAM APP
    deregisterBtn.addEventListener('click', async function () {
        const ld = JSON.parse(localStorage.getItem('tims'))
        const request = await requestAPI(url + '/deregister', 'post', {
            token: ld.data.token
        })
        if (request) {
            localStorage.setItem('tims', JSON.stringify({
                ...ld,
                form: {
                    ...ld.form,
                    step: 'register'
                },
                data: {}
            }))
        }

        formUiController()
    })




    // GRAB STOP BUTTON
    stopButton.addEventListener('click', async function () {
        /* const ld = JSON.parse(localStorage.getItem('tims'))
        const request = await requestAPI(url + '/message/stop', 'post', { data: 'data' })
        if (request) {
            localStorage.setItem('tims', JSON.stringify({
                ...ld,
                form: {
                    ...ld.form,
                    step: 'messaging'
                }
            }))
        } */
        working = false
        count = 0
        clearInterval(interval)
        if (timerInterval) clearInterval(timerInterval)
        formUiController()
        setStats()

    })



    // GRAB RANGE SLIDER
    const slider = document.querySelector('#interval')
    const sliderDataField = document.querySelector('#interval-data')
    sliderDataField.innerHTML = `${slider.value} ${slider.value === '1' ? 'minute' : 'minutes'}`
    slider.addEventListener('input', function (event) {
        sliderDataField.innerHTML = `${event.target.value} ${event.target.value === '1' ? 'minute' : 'minutes'}`
    })




}


async function requestAPI(url, method, data = {}, success = function () { }) {
    try {

        const req = await fetch(url, {
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
            method: method
        })
        const response = await req.json()
        if (!response.status) {
            throw response.message
        }
        success()
        return response


    } catch (error) {
        console.error(error)
        alert('ERROR ARISED:\n' + error)
        return false
    }
}


function formUiController() {
    let ld = JSON.parse(localStorage.getItem('tims'))

    const registerCont = document.querySelector('#register-container')
    const confirmCont = document.querySelector('#confirm-container')
    const messagingCont = document.querySelector('#messaging-container')
    const workingCont = document.querySelector('#working-container')
    const passCont = document.querySelector('#password-container')

    const deregisterBtn = document.querySelector('#deregister-button')

    const cssClasses = ['show', 'no-show']

    if (working) {
        cssClassChecker(registerCont, cssClasses, [false, true])
        cssClassChecker(confirmCont, cssClasses, [false, true])
        cssClassChecker(messagingCont, cssClasses, [false, true])
        cssClassChecker(workingCont, cssClasses, [true, false])
        cssClassChecker(deregisterBtn, cssClasses, [false, false])
        cssClassChecker(passCont, cssClasses, [false, true])
        return
    }

    switch (ld.form.step) {
        case 'register':
            cssClassChecker(registerCont, cssClasses, [true, false])
            cssClassChecker(confirmCont, cssClasses, [false, true])
            cssClassChecker(messagingCont, cssClasses, [false, true])
            cssClassChecker(workingCont, cssClasses, [false, true])
            cssClassChecker(deregisterBtn, cssClasses, [false, true])
            cssClassChecker(passCont, cssClasses, [false, true])
            break
        case 'confirm':
            cssClassChecker(registerCont, cssClasses, [false, true])
            cssClassChecker(confirmCont, cssClasses, [true, false])
            cssClassChecker(messagingCont, cssClasses, [false, true])
            cssClassChecker(workingCont, cssClasses, [false, true])
            cssClassChecker(deregisterBtn, cssClasses, [false, true])
            cssClassChecker(passCont, cssClasses, [false, true])
            break
        case 'password':
            cssClassChecker(registerCont, cssClasses, [false, true])
            cssClassChecker(confirmCont, cssClasses, [false, true])
            cssClassChecker(messagingCont, cssClasses, [false, true])
            cssClassChecker(workingCont, cssClasses, [false, true])
            cssClassChecker(deregisterBtn, cssClasses, [false, true])
            cssClassChecker(passCont, cssClasses, [true, false])

            break
        case 'messaging':
            cssClassChecker(registerCont, cssClasses, [false, true])
            cssClassChecker(confirmCont, cssClasses, [false, true])
            cssClassChecker(messagingCont, cssClasses, [true, false])
            cssClassChecker(workingCont, cssClasses, [false, true])
            cssClassChecker(deregisterBtn, cssClasses, [true, false])
            cssClassChecker(passCont, cssClasses, [false, true])
            break
    }



}

function cssClassChecker(element, classes = [], desirable = []) {
    for (let i = 0; i < classes.length; i++) {
        if (element.classList.contains(classes[i]) && desirable[i] === false) {
            element.classList.remove(classes[i])
        } else if (!element.classList.contains(classes[i]) && desirable[i] === true) {
            element.classList.add(classes[i])
        }
    }
}


function getFormDataAndReturnJSON(target) {
    const formData = new FormData(target)
    let data = {}
    formData.forEach((value, key) => (data[key] = value))
    return data
}


function setStats(data = {}) {
    // console.log('data: ', data)
    clearInterval(timerInterval)
    const statsContainer = document.querySelector('#stats')
    const successList = statsContainer.querySelector('#success')
    const unsuccessList = statsContainer.querySelector('#unsuccess')
    successList.innerHTML = ''
    unsuccessList.innerHTML = ''

    if (data.data && data.data) {
        const successTitle = document.createElement('p')
        const unsuccessTitle = document.createElement('p')
        successTitle.className = unsuccessTitle.className = 'text lg'
        successTitle.innerHTML = 'Successful'
        unsuccessTitle.innerHTML = 'Unsuccessful'

        if (data.data.status) {
            statsContainer.querySelector('#status').innerHTML = data.data.status
        }


        if (data.data.stats.success.length > 0) {
            successList.appendChild(successTitle)
            data.data.stats.success.forEach(stat => {
                const li = document.createElement('li')
                li.className = 'text success'
                li.innerHTML = stat.channel
                successList.appendChild(li)
                count += 1
            })
        }
        if (data.data.stats.unsuccess.length > 0) {
            unsuccessList.appendChild(unsuccessTitle)
            data.data.stats.unsuccess.forEach(stat => {
                const li = document.createElement('li')
                li.className = 'text danger'
                li.innerHTML = `Channel: ${stat.channel} - Error: ${stat.error} - Reason: ${stat.reason} - Type: ${stat.type}`
                unsuccessList.appendChild(li)
            })
        }

        startTimer(60 * Number(data.data.data.interval), statsContainer.querySelector('#status'))
    }

    statsContainer.querySelector('#count').innerHTML = count
}


function startTimer(duration, display) {
    var timer = duration, minutes, seconds;
    timerInterval = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            timer = duration;
        }
    }, 1000);
}