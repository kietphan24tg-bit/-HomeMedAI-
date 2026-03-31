import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import StatePanel from '@/src/components/state/StatePanel';
import FamilyMedicineInventoryScreen from '@/src/screens/family/FamilyMedicineInventoryScreen';
import { getFamilyById } from '@/src/screens/family/familyShared';
import { colors } from '@/src/styles/tokens';

export default function FamilyMedicineRoute() {
    const { familyId } = useLocalSearchParams<{ familyId: string }>();
    const family = getFamilyById(familyId);

    if (!family) {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: colors.bg,
                    justifyContent: 'center',
                }}
            >
                <StatePanel
                    variant='empty'
                    title='Không tìm thấy gia đình'
                    message='Không thể mở tủ thuốc vì gia đình này không còn tồn tại.'
                />
            </View>
        );
    }

    return <FamilyMedicineInventoryScreen family={family} />;
}
