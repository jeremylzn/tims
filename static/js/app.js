const url = 'http://192.168.0.16'

window.onload = async function () {
    const registerForm = document.querySelector('#register-form')
    const confirmForm = document.querySelector('#confirm-form')
    const messageForm = document.querySelector('#message-form')

    const registerLoader = document.querySelector('#register-loader')
    const confirmLoader = document.querySelector('#confirm-loader')
    const messageLoader = document.querySelector('#message-loader')

    const stopButton = document.querySelector('#stop-message')

    const deregisterBtn = document.querySelector('#deregister-button')

    const stats = document.querySelector('#stats')



    if (!localStorage.getItem('tims')) {
        localStorage.setItem('tims', JSON.stringify({
            form: {
                step: 'register'
            },
            token: ''
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

        const go = await requestAPI(url + '/register', 'post', getFormDataAndReturnJSON(event.target))
        console.log('go: ', go)
        if (go) {
            localStorage.setItem('tims', JSON.stringify({
                ...ld,
                form: {
                    ...ld.form,
                    step: 'confirm'
                },
                token: go.data
            }))
        }
        formUiController()

        cssClassChecker(registerLoader, ['show'], [false])
        cssClassChecker(registerForm, ['no-show'], [false])

    })


    // SECOND STEP 
    // CONFIRM
    confirmForm.addEventListener('submit', async function (event) {
        const ld = JSON.parse(localStorage.getItem('tims'))
        cssClassChecker(confirmLoader, ['show'], [true])
        cssClassChecker(confirmForm, ['no-show'], [true])
        event.preventDefault()

        const go = await requestAPI(url + '/confirm', 'post', {
            ...getFormDataAndReturnJSON(event.target),
            token: ld.token
        })
        console.log('go: ', go)
        if (go) {
            localStorage.setItem('tims', JSON.stringify({
                ...ld,
                form: {
                    ...ld.form,
                    step: 'messaging'
                },
                token: go.data
            }))
        }
        formUiController()

        cssClassChecker(confirmLoader, ['show'], [false])
        cssClassChecker(confirmForm, ['no-show'], [false])
    })



    // THIRD STEP
    // MESSAGING
    messageForm.addEventListener('submit', async function (event) {
        const ld = JSON.parse(localStorage.getItem('tims'))
        event.preventDefault()

        const formData = getFormDataAndReturnJSON(event.target)
        const data = {
            ...formData,
            channels: formData.channels.split('--')
        }


        localStorage.setItem('tims', JSON.stringify({
            ...ld,
            form: {
                ...ld.form,
                step: 'working'
            }
        }))
        formUiController()


        const go = await requestAPI(url + '/message', 'post', data)
        console.log('go: ', go)
    })


    // DEREGISTER TELEGRAM APP
    deregisterBtn.addEventListener('click', async function () {
        const ld = JSON.parse(localStorage.getItem('tims'))
        const go = await requestAPI(url + '/deregister', 'post', JSON.parse(localStorage.getItem('tims')))
        console.log('go: ', go)
        if (go) {
            localStorage.setItem('tims', JSON.stringify({
                ...ld,
                form: {
                    ...ld.form,
                    step: 'register'
                },
                token: ''
            }))
        }

        formUiController()
    })




    // GRAB STOP BUTTON
    stopButton.addEventListener('click', async function () {
        const ld = JSON.parse(localStorage.getItem('tims'))
        const go = await requestAPI(url + '/message/stop', 'post', { data: 'data' })
        console.log('go: ', go)
        if (go) {
            localStorage.setItem('tims', JSON.stringify({
                ...ld,
                form: {
                    ...ld.form,
                    step: 'messaging'
                }
            }))
        }
        formUiController()
    })



    // GRAB RANGE SLIDER
    const slider = document.querySelector('#interval')
    const sliderDataField = document.querySelector('#interval-data')
    sliderDataField.innerHTML = slider.value
    slider.addEventListener('input', function (event) {
        sliderDataField.innerHTML = event.target.value
    })


    // WEBSOCKET
    socket.on('tims-request-send-message', async function (data) {
        stats.querySelector('#count').innerHTML = '...'
        const ld = JSON.parse(localStorage.getItem('tims'))
        if (ld.form.step != 'working') {
            localStorage.setItem('tims', JSON.stringify({
                ...ld,
                form: {
                    ...ld.form,
                    step: 'working'
                }
            }))
            formUiController()
        }
        console.log(data);
        stats.querySelector('#count').innerHTML = data.count
        stats.querySelector('#status').innerHTML = data.status
    })

}

async function requestAPI(url, method, data = {}, success = function () { }) {
    try {

        const res = await fetch(url, {
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
            method: method
        })

        const resData = await res.json()
        if (res.status === 200) {
            success()
            return resData
        } else {
            alert(res)
            return false
        }

    } catch (error) {
        console.warn(error)
        return false
    }
}


function formUiController() {
    let ld = JSON.parse(localStorage.getItem('tims'))

    const registerCont = document.querySelector('#register-container')
    const confirmCont = document.querySelector('#confirm-container')
    const messagingCont = document.querySelector('#messaging-container')
    const workingCont = document.querySelector('#working-container')

    const deregisterBtn = document.querySelector('#deregister-button')

    const cssClasses = ['show', 'no-show']

    console.log(ld.form.step);
    switch (ld.form.step) {
        case 'register':
            cssClassChecker(registerCont, cssClasses, [true, false])
            cssClassChecker(confirmCont, cssClasses, [false, true])
            cssClassChecker(messagingCont, cssClasses, [false, true])
            cssClassChecker(workingCont, cssClasses, [false, true])
            cssClassChecker(deregisterBtn, cssClasses, [false, true])
            break
        case 'confirm':
            cssClassChecker(registerCont, cssClasses, [false, true])
            cssClassChecker(confirmCont, cssClasses, [true, false])
            cssClassChecker(messagingCont, cssClasses, [false, true])
            cssClassChecker(workingCont, cssClasses, [false, true])
            cssClassChecker(deregisterBtn, cssClasses, [false, true])
            break
        case 'messaging':
            cssClassChecker(registerCont, cssClasses, [false, true])
            cssClassChecker(confirmCont, cssClasses, [false, true])
            cssClassChecker(messagingCont, cssClasses, [true, false])
            cssClassChecker(workingCont, cssClasses, [false, true])
            cssClassChecker(deregisterBtn, cssClasses, [true, false])
            break
        case 'working':
            cssClassChecker(registerCont, cssClasses, [false, true])
            cssClassChecker(confirmCont, cssClasses, [false, true])
            cssClassChecker(messagingCont, cssClasses, [false, true])
            cssClassChecker(workingCont, cssClasses, [true, false])
            cssClassChecker(deregisterBtn, cssClasses, [false, false])
            break
        default:
            console.log('register-default-state');
            cssClassChecker(registerCont, cssClasses, [true, false])
            cssClassChecker(confirmCont, cssClasses, [false, true])
            cssClassChecker(messagingCont, cssClasses, [false, true])
            cssClassChecker(workingCont, cssClasses, [false, true])
            cssClassChecker(deregisterBtn, cssClasses, [false, false])
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
    // console.log(element.classList);

}


function getFormDataAndReturnJSON(target) {

    const formData = new FormData(target)
    let data = {}
    formData.forEach((value, key) => (data[key] = value))
    return data

}