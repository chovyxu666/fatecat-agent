import { getUserId } from '../utils/userIdUtils';
import { apiService } from '../services/apiService';

interface BaZiRequest {
    user_id?: string,
    date_time: string,
    date_type: string | number,
    sex: string,
    district_provincial: string,
    district_county: string,
    district_city: string
}

export const deleteHistory = async (name: string = '') => {
    try {
        await apiService.post('/deleteHistory', {
            user_id: getUserId(name),
            message: ""
        });
    } catch (error) {
        console.error('删除历史记录请求失败:', error);
    }
};
export const getBaZiResult = async (request: BaZiRequest) => {
    request.user_id = getUserId('bazi')
    return apiService.post('/getBaZiResult', request)
};
