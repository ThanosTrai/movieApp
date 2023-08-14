$(document).ready( function() {
    var debounceTimeout = null
    $('#searchInput').on('input', function() {
        clearTimeout(debounceTimeout)
        debounceTimeout = setTimeout(() => getMovie(this.value.trim()), 1500)
    })

    $('#showMore').on('click', function() {
        onShowMoreClicked()
    })
})

function getMovie(title) {
    if (!title) {
        return
    }

    onBeforeSend()
    fetchMovieFromApi(title)
}

function fetchMovieFromApi(title) {
    let ajaxRequest = new XMLHttpRequest()
    const apiKey = "xxxxxxxx";
    ajaxRequest.open('GET', `http://omdbapi.com/?t=${title}&apikey=${apiKey}`, true)
    ajaxRequest.timeout = 5000
    ajaxRequest.ontimeout = (e) => onApiError()
    ajaxRequest.onreadystatechange = function() {
        if (ajaxRequest.readyState === 4) {
            if (ajaxRequest.status === 200) {
                handleResults(JSON.parse(ajaxRequest.responseText))
            }
            else {
                onApiError()
            }
        }
    }
    ajaxRequest.send()
}

function handleResults(results) {
    if (results.Response === 'True') {
        let transformed = transformResponse(results)
        buildMovie(transformed)
    } else {  // if (results.Response === 'False')
        hideComponent('#waiting')
        showNotFound()
    }
}

function buildMovie(apiResponse) {
    if (apiResponse.poster) {
        $('#image').attr('src', apiResponse.poster).on('load', function() {
            buildMovieMetadata(apiResponse) // todo image -> $(this)
        })
    } else {
        buildMovieMetadata(apiResponse)
    }
}

function onBeforeSend() {
    showComponent('#waiting')
    hideComponent('.movie')
    hideNotFound()
    hideError()
    collapsePlot()
    hideExtras()
}

function onApiError() {
    hideComponent('#waiting')
    showError()
}

function buildMovieMetadata(apiResponse) {  // todo imageTag
    hideComponent('#waiting')
    // handleImage(imageTag)
    handleLiterals(apiResponse)
    showComponent('.movie')
}

function handleLiterals(apiResponse) {
    $('.movie').find('[id]').each((index, item) => {
        if ($(item).is('a')) {
            $(item).attr('href', apiResponse[item.id])
        } else {
            let valueElement = $(item).children('span')
            let metadataValue = (apiResponse[item.id]) ? apiResponse[item.id] : '-'
            valueElement.length ? valueElement.text(metadataValue) : $(item).text(metadataValue)
        }
    })
}

function transformResponse(apiResponse) {
    let camelCaseKeysResponse = camelCaseKeys(apiResponse)
    buildImdbLink(camelCaseKeysResponse)
    clearNotAvailableInformation(camelCaseKeysResponse)
    return camelCaseKeysResponse
}

function camelCaseKeys(apiResponse) {
    return _.mapKeys(apiResponse, (v, k) => _.camelCase(k))
}

function buildImdbLink(apiResponse) {
    if (apiResponse.imdbId & apiResponse.imdbId !== 'N/A') {
        apiResponse.imdbId = `https://www.imdb.com/title/${apiResponse.imdbId}`
    }
}

function clearNotAvailableInformation(apiResponse) {
    for (let key in apiResponse) {
        if (apiResponse.hasOwnProperty(key) && apiResponse[key] === 'N/A') {
            apiResponse[key] = ''
        }
    }
}

function onShowMoreClicked() {
    $('#plot').toggleClass('expanded')
    if ($('.extended').is(':visible')) {
        $('.extended').hide(700)
    }
    else {
        $('.extended').show(700)
    }
}

function showComponent(jquerySelector) {
    return $(jquerySelector).removeClass('hidden')
}

function hideComponent(jquerySelector) {
    return $(jquerySelector).addClass('hidden')
}

function showNotFound() {
    $('.not-found').clone().removeClass('hidden').appendTo($('.center'))
}

function hideNotFound() {
    $('.center').find('.not-found').remove()
}

function showError() {
    $('.error').clone().removeClass('hidden').appendTo($('.center'))
}

function hideError() {
    $('.center').find('.error').remove()
}

function hideExtras() {
    $('.extended').hide()
}

function collapsePlot() {
    $('#plot').removeClass('expanded')
}