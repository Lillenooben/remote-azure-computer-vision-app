/* eslint-disable prettier/prettier */
const { ImageAnalysisClient } = require('@azure-rest/ai-vision-image-analysis');
const createClient = require('@azure-rest/ai-vision-image-analysis').default;
const { AzureKeyCredential } = require('@azure/core-auth');
const fs = require('fs').promises; // Import the fs module for file operations
const files = require('fs');





// Initialize Azure Cognitive Services client
const key = '0f9877ef09fe4b9cbede47dd30650c3d';
const endpoint = 'https://huskvarnagrp2.cognitiveservices.azure.com/';
const credential = new AzureKeyCredential(key);
const client = createClient(endpoint, credential);

// Bearer token for authentication
const bearerToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidXNlciIsInV1aWQiOiJkMTRjNTNiMC01YzUzLTRkMjMtYWI1Mi02YTI0YzVkNjNmZDYiLCJpYXQiOjE3MTY5MTIxNzcsImV4cCI6MTcxNjk1NTM3N30.pHUG88HREvQeeCWI3_HZ4quKdVFjxZbCH3quUBG-P1s';

// Dynamic import for node-fetch
async function fetchNodeFetch() {
    const { default: fetch } = await import('node-fetch');
    return fetch;
}

// Fetch the image binary data with Bearer token
async function fetchImageData(url, token) {
    const fetch = await fetchNodeFetch();
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return arrayBuffer;
}

// Convert ArrayBuffer to Buffer
function arrayBufferToBuffer(arrayBuffer) {
    return Buffer.from(arrayBuffer);
}

// Save Buffer as a file
async function saveBufferAsFile(buffer, filename) {
    await fs.writeFile(filename, buffer);
    console.log(`Image saved as ${filename}`);
}

// Function to read local image file as a Buffer
function readLocalImage(imagePath) {
    return new Promise((resolve, reject) => {
        files.readFile(imagePath, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(data);
        });
    });
}

// Function to rename the image file
async function renameImage(oldPath, newPath) {
    try {
        await fs.rename(oldPath, newPath);
        console.log(`Image renamed to ${newPath}`);
    } catch (error) {
        console.error('Error renaming image:', error);
    }
}

// Analyze image function
async function analyzeImage(imagePath) {
    try {
        // Read local image file
        var newPath = ""
        const imageData = await readLocalImage(imagePath);
        const features = [
            'Caption',
            'DenseCaptions',
            'Objects',
            'People',
            'Read',
            'SmartCrops',
            'Tags',
        ];
        // Analyze image
        const result = await client.path('/imageanalysis:analyze').post({
            contentType: 'image/jpeg', // Adjust the content type based on your image type
            body: imageData,
            queryParameters: {
                features: features,
                language: 'en',
                'gender-neutral-captions': 'true',
                'smartCrops-aspect-ratios': [0.9, 1.33],
            },
        });
        const iaResult = result.body;
        if (iaResult.captionResult) {
            const caption = iaResult.captionResult.text;
            console.log(
                `Caption: ${iaResult.captionResult.text} (confidence: ${iaResult.captionResult.confidence})`,
            );
            // Rename the image file
            newPath = `${imagePath.substring(0, imagePath.lastIndexOf('.'))}_${caption}.png`;
            await renameImage(imagePath, newPath);
        }
    } catch (error) {
        console.error('Error analyzing image:', error);
    }
    return newPath
}
// Main function to fetch, convert, save, and analyze the image
async function main() {
    const imageURL =
        `http://185.216.26.111:8000/location/crash/${uuid}`;
    try {
        const imageData = await fetchImageData(imageURL);
        const imageBuffer = arrayBufferToBuffer(imageData);
        const filename = 'image.png';
        await saveBufferAsFile(imageBuffer, filename);
        const imagePath = '../image.png';
        analyzeImage(imagePath); // Analyze the image from the original URL
    } catch (error) {
        console.error('Error in processing the image:', error);
    }
}

module.export = async function classifyImage(token, uuid) {
    const imageURL = `http://185.216.26.111:8000/location/crash/${uuid}`;
    var classification = ""
    try {
        const imageData = await fetchImageData(imageURL, token);
        const imageBuffer = arrayBufferToBuffer(imageData);
        const filename = 'image.png';
        await saveBufferAsFile(imageBuffer, filename);
        const imagePath = '../image.png';
        classification = analyzeImage(imagePath); // Analyze the image from the original URL
    } catch (error) {
        console.error('Error in processing the image:', error);
    }
    return classification
}

main().catch((err) => console.error(err));