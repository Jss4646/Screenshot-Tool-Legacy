import resolutions from '../../resolutionsJson.js'

const selectAllResolutionsButton = document.querySelector('.select-all-button');
const deselectAllResolutionsButton = document.querySelector('.deselect-all-button');

/**
 * Generates all resolutions in the resolutions json as htmlElements
 */
for (let resolutionJson in resolutions) {
    let resolutionData = resolutions[resolutionJson];
    generateResolutionElement(resolutionData, resolutionJson)
    generateDefaultResolutionElement(resolutionData, resolutionJson)
}


/**
 * Adds a resolution checkbox to the resolution list
 *
 * @param {Object.<string, resolution{width, height}, isCheckedOnLoad>} resolutionData
 * @param key
 */
function generateResolutionElement(resolutionData, key) {
    let resolutionElement = document.createElement('label');
    resolutionElement.classList.add('resolution-container');

    let resolutionCheckbox = generateResolutionCheckbox(key);

    resolutionElement.appendChild(resolutionCheckbox);

    resolutionElement.append(resolutionData.deviceName);
    resolutionList.appendChild(resolutionElement);
}

/**
 * Creates and adds checkbox elements to the default resolution list
 *
 * @param resolutionData - resolution name
 * @param key - resolution key
 */
function generateDefaultResolutionElement(resolutionData, key) {
    let resolutionElement = document.createElement('label');
    resolutionElement.classList.add('default-resolution-container');

    let resolutionCheckbox = generateResolutionCheckbox(key);
    resolutionElement.appendChild(resolutionCheckbox);
    resolutionElement.append(resolutionData.deviceName);

    resolutionElement.addEventListener('change', updateDefaultResList);
    defaultResolutionList.appendChild(resolutionElement);
}

/**
 * Creates and adds checkbox elements to the resolution list
 *
 * @param key
 * @return {HTMLInputElement}
 */
function generateResolutionCheckbox(key) {
    let resolutionCheckbox = document.createElement('input');
    resolutionCheckbox.type = 'checkbox';
    resolutionCheckbox.name = key;
    resolutionCheckbox.checked = getDefaultCheckState(key);
    return resolutionCheckbox;
}

/**
 * Gets the default checked state for the checkbox by the key of the resolution
 *
 * @param resolutionKey
 * @return {boolean | string}
 */
function getDefaultCheckState(resolutionKey) {
    let defaultResolutionList = JSON.parse(localStorage.getItem('defaultResolutionList'));
    if (defaultResolutionList) {
        return defaultResolutionList[resolutionKey];
    } else {
        return false;
    }
}

/**
 * updates the default res list stored in local storage
 */
function updateDefaultResList() {
    let resolutionCheckStates = getResolutionCheckStates();
    console.log(resolutionCheckStates);
    localStorage.setItem('defaultResolutionList', JSON.stringify(resolutionCheckStates))
}

/**
 * Gets the state of the checkboxs in the default resolution list
 *
 * @return {{string: boolean}}
 */
function getResolutionCheckStates() {
    let resolutionCheckStates = {};

    let resolutionElements = document.querySelectorAll('.default-resolution-container');
    resolutionElements.forEach(resolutionElement => {
        let checkbox = resolutionElement.firstChild;
        let checkboxState = checkbox.checked;
        let checkboxKey = resolutionElement.firstChild.name;

        resolutionCheckStates[checkboxKey] = checkboxState;
    })

    return resolutionCheckStates;
}

const resolutionArray = Array.from(resolutionList.children);

/**
 * Event listeners to select/deselect all resolutions
 */
selectAllResolutionsButton.addEventListener('click', () => {
    resolutionArray.forEach((resolutionElement) => {
        resolutionElement.firstChild.checked = true;
    })
});

deselectAllResolutionsButton.addEventListener('click', () => {
    resolutionArray.forEach((resolutionElement) => {
        resolutionElement.firstChild.checked = false;
    })
});