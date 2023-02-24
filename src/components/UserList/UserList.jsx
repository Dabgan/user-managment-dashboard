import React, { useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Button,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import {
    fetchUsers,
    openModal,
    selectAllUsers,
} from '../../reducers/usersReducer';
import User from '../User/User';

const UserList = () => {
    const { users, isLoading, error } = useSelector(selectAllUsers);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchUsers());
    }, []);

    if (isLoading) {
        return <CircularProgress />;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <>
            <div>
                <Button
                    variant="contained"
                    onClick={() => {
                        dispatch(openModal());
                    }}
                >
                    Add user
                </Button>
            </div>
            <TableContainer component={Paper}>
                <Table aria-label="users table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Id</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Username</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>City</TableCell>
                            <TableCell>Edit</TableCell>
                            <TableCell>Delete</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users &&
                            users.map((user) => (
                                <User key={user.id} userData={user}></User>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};

export default UserList;
