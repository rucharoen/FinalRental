import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FCFCFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C3E50',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    imageUploadContainer: {
        width: '100%',
        height: 200,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    imagePlaceholder: {
        fontSize: 16,
        color: '#7F8C8D',
    },
    imageSection: {
        marginBottom: 24,
    },
    imagesList: {
        flexDirection: 'row',
    },
    imageWrapper: {
        width: 100,
        height: 100,
        marginRight: 12,
        position: 'relative',
    },
    imageThumbnail: {
        width: 100,
        height: 100,
        borderRadius: 8,
        backgroundColor: '#F0F0F0',
    },
    removeImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        zIndex: 1,
    },
    addMoreImage: {
        width: 100,
        height: 100,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addMoreText: {
        fontSize: 12,
        color: '#BDC3C7',
        marginTop: 4,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#2C3E50',
    },
    textarea: {
        height: 100,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfInput: {
        width: '48%',
    },
    submitButton: {
        backgroundColor: '#3498DB',
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    selectedImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    loader: {
        marginTop: 20,
    }
});
