import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Loader, Pencil, Trash2, FileText, BookOpen, Wrench } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { getAllTeams, Team, addTeam, updateTeam, deleteTeam } from '@/services/dataService';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ListingForm } from '@/components/forms/ListingForm';
import ListingCard from '@/components/ListingCard';
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import getStatusBadge from '@/components/ui/CustomBadges';

const TeamsPage = () => {
  const [Teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  // State to toggle between card and list view
  const [isCardView, setIsCardView] = useState(true);
  const [currentTeams, setCurrentTeams] = useState<Team | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [TeamsToDelete, setTeamsToDelete] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalRecords: 0,
  });

  useEffect(() => {
    fetchTeams(pagination.page, pagination.limit);
  }, [pagination.page, pagination.limit]);


  const fetchTeams = async (page: number, limit: number) => {
    try {
      setIsLoading(true);
      const data = await getAllTeams();
      setTeams(data);
    } catch (error) {
      console.error('Error fetching Teams:', error);
      toast.error('Failed to load Teams');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd =  () => {
    setCurrentTeams(null);
    setFormOpen(true);
  };

  const handleEdit = (id: number) => {
    const Team = Teams.find((g) => g.id === id);
    console.log('Editing Team:', Team);
    if (Team) {
      setCurrentTeams(() => Team);
      setFormOpen(true);
    }
  };

  const handleDelete = (id: number) => {
    setTeamsToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdate = async (values) => {
    if (!currentTeams) return;
    
    try {
      setIsProcessing(true);
      const response = await updateTeam(currentTeams.id, {
        ...values
      });

      setTeams(Teams.map(r => r.id === currentTeams.id ? { ...r, ...response } : r));
      setFormOpen(false);
      toast.success('Teams updated successfully');
    } catch (error) {
      console.error('Error updating Teams:', error);
      toast.error('Failed to update Teams');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!TeamsToDelete) return;

    try {
      setIsProcessing(true);
      await deleteTeam(TeamsToDelete);
      setTeams(Teams.filter(r => r.id !== TeamsToDelete));
      toast.success('Teams deleted successfully');
    } catch (error) {
      console.error('Error deleting Teams:', error);
      toast.error('Failed to delete Teams');
    } finally {
      setIsProcessing(false);
        setIsDeleteDialogOpen(false);
        setTeamsToDelete(null);
    }
  };

const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchTeams(newPage, pagination.limit);
  };
  const additionalFields = [
    {name:"name", label:"Name", type:"text", placeholder:"Enter Team name", required:true},
    {name:"status", label:"Status", type:"option", placeholder:"Enter Team status",required:true, options: [
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' },
      { value: 'Archived', label: 'Archived' },
      { value: 'Draft', label: 'Draft' },
    ]},
    {name:"description", label:"Description", type:"textarea", placeholder:"Enter Team description",required:true},
    {name:"published", label:"Published", type:"switch", placeholder:"Enter Team published",required:false}
  ]

  const handleFormSubmit = async (values) => {
    try{
        const newTeams: Team = await addTeam(values);
        setTeams([...Teams, newTeams]);
        setFormOpen(false);
        toast.success('Teams added successfully');
    } catch (error) {
        console.error('Error adding Teams:', error);
        toast.error('Failed to add Teams');
        throw error;
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Travel Teams</h1>
          <p className="text-muted-foreground mt-1">
            Manage Teams
          </p>
        </div>
        <Button 
          className="mt-4 md:mt-0 bg-travel-600 hover:bg-travel-700"
          onClick={handleAdd}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Teams
        </Button>
        {/* Toggle between listings */}
        <div className='flex justify-end'>
            <button
            onClick={() => setIsCardView(!isCardView)}
            className={`w-14 h-8 flex items-center rounded-full p-1 transition duration-300 focus:outline-none ${
                isCardView ? "bg-blue-500" : "bg-gray-300"
            }`}
            >
            <div
                className={`w-6 h-6 bg-white rounded-full shadow-md transform transition duration-300 ${
                isCardView ? "translate-x-6" : ""
                }`}
            ></div>
            </button>
        </div>
      
      {/* End of toggle  */}
      </div>
      
      <Separator className="my-6" />
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="h-8 w-8 animate-spin text-travel-600" />
        </div>
      ) : Teams.length === 0 ? (
        <div className="text-center p-12 border rounded-lg bg-muted/30">
          <h3 className="text-xl font-semibold mb-2">No Teams found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first travel Teams
          </p>
          <Button onClick={handleAdd}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Teams
          </Button>
        </div>
      ) : isCardView ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Teams.map((Team) => (
            <ListingCard
              key={Team.id}
              id={Team.id}
              title={Team.name}
              description={`${Team.description}`}
              badges={[ Team.status, Team.published === "1" ? "Published" : "Unpublished"]}
              price={null}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Published</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Teams.map((Team) => (
                        <TableRow key={Team.id}>
                            <TableCell className="font-medium">{Team.name}</TableCell>
                            <TableCell>{Team.description.slice(0,20)}...</TableCell>
                            <TableCell>{getStatusBadge(Team.status)}</TableCell>
                            <TableCell className="text-right">{getStatusBadge(Team.published)}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleEdit.bind(null, Team.id)}
                                        className="bg-travel-100 text-travel-800 border-travel-200 hover:bg-travel-200"
                                    >
                                        <Pencil className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDelete.bind(null, Team.id)}
                                        className="bg-red-100 text-red-800 border-travel-200 hover:bg-red-200"
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Delete
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )}

      {/* Add Teams Dialog */}
      {!currentTeams && (
        <ListingForm
          open={formOpen}
          onOpenChange={setFormOpen}
          title="Add New Teams"
          fields={additionalFields}
          initialValues={{name: '', description: '', status: 'Active'}}
          onSubmit={handleFormSubmit}
        />
      )}
    
      {/* Edit Teams Dialog */}
      {currentTeams && (
        <ListingForm
          open={formOpen}
          onOpenChange={setFormOpen}
          title={`Update Teams: ${currentTeams.name}`}
          fields={additionalFields}
          initialValues={currentTeams ? { ...currentTeams } : {}}
          onSubmit={handleUpdate}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Teams"
        description={`Are you sure you want to delete the Team? This action cannot be undone.`}
        isDeleting={isProcessing}
      />
    </>
  );
};

export default TeamsPage;
