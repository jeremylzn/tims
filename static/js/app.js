let step = 1

window.onload = function () {
    const registerCont = document.querySelector('#register-container')
    const messagingCont = document.querySelector('#messaging-container')
    const registerForm = document.querySelector('#register-form')
    const messageForm = document.querySelector('#message-form')
    const registerLoader = document.querySelector('#register-loader')


    // FIRST STEP
    // TELEGRAM APP REGISTRATION
    registerForm.addEventListener('submit', async function (event) {
        event.preventDefault()

        registerLoader.classList.add('show')
        registerForm.classList.add('no-show')
        const data = JSON.stringify(getFormDataAndReturnJSON(event.target))

        const res = await fetch('http://localhost/register', {
            body: data,
            headers: { 'Content-Type': 'application/json' },
            method: 'post'
        })

        if (res.status === 200) {
            registerCont.classList.toggle('show')
            messagingCont.classList.toggle('show')

            const resData = await res.json()
            localStorage.setItem('token', JSON.stringify(resData))


            console.log('data: ', resData)
        }

        registerLoader.classList.remove('show')
        registerForm.classList.remove('no-show')


    })

    // SECOND STEP
    // MESSAGING
    messageForm.addEventListener('submit', async function (event) {
        event.preventDefault()

        const data = getFormDataAndReturnJSON(event.target)

        const res = await fetch('http://localhost/message', {
            body: JSON.stringify({
                interval: data.interval,
                channels: data.channels.split('--'),
                message: data.message
            }),
            headers: { 'Content-Type': 'application/json' },
            method: 'post'
        })

        if (res.status === 200) {
            const resData = await res.json()
            console.log('resData: ', resData)

            localStorage.setItem('workData', true)
        }
    })


    // GRAB RANGE SLIDER
    const slider = document.querySelector('#interval')
    const sliderDataField = document.querySelector('#interval-data')
    sliderDataField.innerHTML = slider.value
    slider.addEventListener('input', function (event) {
        sliderDataField.innerHTML = event.target.value
    })


    // CHECK IF REGISTERED ONLOAD
    if (localStorage.getItem('token')) {
        registerCont.classList.toggle('show')
        messagingCont.classList.toggle('show')
    }


}



function getFormDataAndReturnJSON(target) {

    const formData = new FormData(target)
    let data = {}
    formData.forEach((value, key) => (data[key] = value))
    return data

}