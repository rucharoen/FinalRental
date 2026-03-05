import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F3F4',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000000',
        marginLeft: 15,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30,
    },
    stepCircle: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        backgroundColor: '#AED6F1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepCircleActive: {
        backgroundColor: '#3498DB',
    },
    stepText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    stepLine: {
        width: 100,
        height: 1,
        backgroundColor: '#000000',
        marginHorizontal: 10,
    },
    content: {
        flex: 1,
        paddingHorizontal: 25,
    },
    label: {
        fontSize: 16,
        color: '#2C3E50',
        marginBottom: 10,
        marginTop: 5,
    },
    uploadPlaceholder: {
        width: '100%',
        aspectRatio: 1.6,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 25,
        position: 'relative',
    },
    uploadPlaceholderVertical: {
        aspectRatio: 0.8,
    },
    cornerMarker: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: '#000000',
    },
    topLeft: {
        top: 10,
        left: 10,
        borderTopWidth: 2,
        borderLeftWidth: 2,
    },
    topRight: {
        top: 10,
        right: 10,
        borderTopWidth: 2,
        borderRightWidth: 2,
    },
    bottomLeft: {
        bottom: 10,
        left: 10,
        borderBottomWidth: 2,
        borderLeftWidth: 2,
    },
    bottomRight: {
        bottom: 10,
        right: 10,
        borderBottomWidth: 2,
        borderRightWidth: 2,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        borderRadius: 4,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        color: '#2C3E50',
        marginBottom: 8,
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#BDC3C7',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    footer: {
        padding: 25,
        alignItems: 'center',
    },
    nextButton: {
        backgroundColor: '#3498DB',
        width: '80%',
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    instructionText: {
        fontSize: 14,
        color: '#7F8C8D',
        textAlign: 'left',
        lineHeight: 20,
        marginBottom: 20,
    },
    warningSection: {
        marginTop: 20,
        width: '100%',
    },
});
