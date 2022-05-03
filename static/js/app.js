const url = 'http://192.168.0.16'

window.onload = async function () {
    const registerForm = document.querySelector('#register-form')
    const confirmForm = document.querySelector('#confirm-form')
    const messageForm = document.querySelector('#message-form')

    const registerLoader = document.querySelector('#register-loader')
    const confirmLoader = document.querySelector('#confirm-loader')

    const stopButton = document.querySelector('#stop-message')



    if (!localStorage.getItem('data')) {
        localStorage.setItem('data', JSON.stringify({
            form: {
                step: 'register'
            },
            token: ''
        }))
    }

    // FORM UI CONTROLLER
    formUiController()
    const localData = JSON.parse(localStorage.getItem('data'))







    // FIRST STEP
    // TELEGRAM APP REGISTRATION
    registerForm.addEventListener('submit', async function (event) {
        cssClassChecker(registerLoader, ['show'], [true])
        cssClassChecker(registerForm, ['no-show'], [true])
        event.preventDefault()

        const go = await requestAPI(url + '/register', 'post', getFormDataAndReturnJSON(event.target))
        console.log('go: ', go)
        if (go) {
            localStorage.setItem('data', JSON.stringify({
                ...localData,
                form: {
                    ...localData.form,
                    step: 'confirm'
                }
            }))
        }
        formUiController()

        cssClassChecker(registerLoader, ['show'], [false])
        cssClassChecker(registerForm, ['no-show'], [false])

    })


    // SECOND STEP 
    // CONFIRM
    confirmForm.addEventListener('submit', async function (event) {
        cssClassChecker(confirmLoader, ['show'], [true])
        cssClassChecker(confirmForm, ['no-show'], [true])
        event.preventDefault()

        const go = await requestAPI(url + '/confirm', 'post', getFormDataAndReturnJSON(event.target))
        console.log('go: ', go)
        if (go) {
            localStorage.setItem('data', JSON.stringify({
                ...localData,
                form: {
                    ...localData.form,
                    step: 'messaging'
                }
            }))
        }
        formUiController()

        cssClassChecker(confirmLoader, ['show'], [false])
        cssClassChecker(confirmForm, ['no-show'], [false])
    })



    // THIRD STEP
    // MESSAGING
    messageForm.addEventListener('submit', async function (event) {
        event.preventDefault()

        const formData = getFormDataAndReturnJSON(event.target)
        const data = {
            ...formData,
            channels: formData.channels.split('--')
        }
        // console.log('data: ', data)

        const go = await requestAPI(url + '/message', 'post', data)
        console.log('go: ', go)


    })


    // GRAB STOP BUTTON
    stopButton.addEventListener('click', async function () {
        const go = await requestAPI(url + '/message/stop', 'post', { data: 'data' })
        console.log('go: ', go)
    })



    // GRAB RANGE SLIDER
    const slider = document.querySelector('#interval')
    const sliderDataField = document.querySelector('#interval-data')
    sliderDataField.innerHTML = slider.value
    slider.addEventListener('input', function (event) {
        sliderDataField.innerHTML = event.target.value
    })


    // WEBSOCKET
    socket.on('tims-request-send-message', function (data) {
        console.log(data);
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
    let localData = JSON.parse(localStorage.getItem('data'))

    const registerCont = document.querySelector('#register-container')
    const confirmCont = document.querySelector('#confirm-container')
    const messagingCont = document.querySelector('#messaging-container')

    const cssClasses = ['show', 'no-show']


    switch (localData.form.step) {
        case 'register':
            console.log('register-state');
            cssClassChecker(registerCont, cssClasses, [true, false])
            cssClassChecker(confirmCont, cssClasses, [false, true])
            cssClassChecker(messagingCont, cssClasses, [false, true])
            break
        case 'confirm':
            console.log('confirm-state');
            cssClassChecker(registerCont, cssClasses, [false, true])
            cssClassChecker(confirmCont, cssClasses, [true, false])
            cssClassChecker(messagingCont, cssClasses, [false, true])
            break
        case 'messaging':
            console.log('messaging-state');
            cssClassChecker(registerCont, cssClasses, [false, true])
            cssClassChecker(confirmCont, cssClasses, [false, true])
            cssClassChecker(messagingCont, cssClasses, [true, false])
            break
        default:
            console.log('register-default-state');
            cssClassChecker(registerCont, cssClasses, [true, false])
            cssClassChecker(confirmCont, cssClasses, [false, true])
            cssClassChecker(messagingCont, cssClasses, [false, true])
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