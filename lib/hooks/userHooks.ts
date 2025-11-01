import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { user } from '../api';
import { userModel } from '../models';

const USER_QUERY_KEY = 'users';
const FAVOURITES_QUERY_KEY = 'favourites';

// --- QUERY HOOKS ---

/**
 * Returns a mutation function for deleting a user.
 * On success, it invalidates the user list to reflect the deletion.
 */
export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id?: number) => user.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY, 'list'] });
            // Also refetch the main session in case a user deletes themselves
            queryClient.invalidateQueries({ queryKey: ['session'] });
        },
    });
};

/**
 * Returns a mutation function for updating the current user's profile.
 * On success, it invalidates the main session query to refetch the user's auth context.
 */
export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: Partial<userModel.MUser>) => user.updateUser(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['session'] });
        },
    });
};



/**
 * Fetches a single user by their ID.
 * The query is disabled by default and will only run if a userId is provided.
 * @param userId The ID of the user to fetch.
 */
// export const useUser = (userId?: number) => {
//     return useQuery({
//         queryKey: [USER_QUERY_KEY, userId],
//         queryFn: () => user.getUserById(userId!),
//         enabled: !!userId, // Only run the query if userId is a valid number
//     });
// };

/**
 * Fetches a paginated and sorted list of all users.
 * @param params Object containing page, pageSize, and sby (sortBy) options.
 */
// export const useUsers = (params: { page?: number, pageSize?: number, sby?: string }) => {
//     return useQuery({
//         queryKey: [USER_QUERY_KEY, 'list', params],
//         queryFn: () => user.listUsers(params),
//         placeholderData: (previousData) => previousData, // Keep old data visible while new data is fetching
//     });
// };

/**
 * Fetches the current user's list of favourite companies and products.
 */
// export const useFavourites = () => {
//     return useQuery({
//         queryKey: [FAVOURITES_QUERY_KEY],
//         queryFn: user.getFavourites,
//     });
// };


// --- MUTATION HOOKS ---

/**
 * Returns a mutation function for creating a new user.
 * On success, it invalidates the user list query to refetch the updated list.
 */
// export const useCreateUser = () => {
//     const queryClient = useQueryClient();
//     return useMutation({
//         mutationFn: (payload: userModel.MUser) => user.createUser(payload),
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY, 'list'] });
//         },
//     });
// };

/**
 * Returns a mutation function for updating the user's language.
 * On success, it invalidates the main session query.
 */
// export const useUpdateUserLanguage = () => {
//     const queryClient = useQueryClient();
//     return useMutation({
//         mutationFn: (language: string) => user.updateUserLanguage(language),
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ['session'] });
//         },
//     });
// };

/**
 * Returns a mutation function for verifying a new phone number with a code.
 * On success, it invalidates the session query to show the updated user details.
 */
// export const useVerifyPhone = () => {
//     const queryClient = useQueryClient();
//     return useMutation({
//         mutationFn: (code: string) => user.verifyPhone(code),
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ['session'] });
//         },
//     });
// };

/**
 * Returns a mutation function for verifying a new email with a code.
 * On success, it invalidates the session query.
 */
// export const useVerifyEmail = () => {
//     const queryClient = useQueryClient();
//     return useMutation({
//         mutationFn: (code: string) => user.verifyEmail(code),
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ['session'] });
//         },
//     });
// };

/**
 * Returns a mutation function for adding a new favourite.
 * On success, it invalidates the favourites list query.
 */
// export const useAddFavourite = () => {
//     const queryClient = useQueryClient();
//     return useMutation({
//         mutationFn: (payload: userModel.FavouriteRequest) => user.addFavourite(payload),
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: [FAVOURITES_QUERY_KEY] });
//         },
//     });
// };

/**
 * Returns a mutation function for removing a favourite.
 * On success, it invalidates the favourites list query.
 */
// export const useRemoveFavourite = () => {
//     const queryClient = useQueryClient();
//     return useMutation({
//         mutationFn: (payload: userModel.FavouriteRequest) => user.removeFavourite(payload),
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: [FAVOURITES_QUERY_KEY] });
//         },
//     });
// };
