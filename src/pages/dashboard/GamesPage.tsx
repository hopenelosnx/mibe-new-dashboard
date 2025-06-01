import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Loader, Pencil, Trash2, FileText, BookOpen, Wrench } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { getTravelResources, TravelResource, addResource, updateResource, deleteResource } from '@/services/dataService';
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

const GamesPage = () => {
  const [Games, setToolkits] = useState<TravelResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  // State to toggle between card and list view
  const [isCardView, setIsCardView] = useState(true);
  const [currentGames, setCurrentGames] = useState<TravelResource | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [gamesToDelete, setGamesToDelete] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalRecords: 0,
  });
  const formatDate = (date: string | Date): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
    };

  useEffect(() => {
    fetchGames();
  }, []);


  const fetchGames = async () => {
    try {
      setIsLoading(true);
      const data = await getTravelResources();
      const Games = data.filter((resource) => resource.type === "games");
      setToolkits(Games);
    } catch (error) {
      console.error('Error fetching Games:', error);
      toast.error('Failed to load Games');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setCurrentGames(null);
    setFormOpen(true);
  };

  const handleEdit = (id: number) => {
    const games = Games.find((g) => g.id === id);
    if (games) {
      setCurrentGames(games);
      setFormOpen(true);
    }
  };

  const handleDelete = (id: number) => {
    setGamesToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdate = async (values) => {
    if (!currentGames) return;
    
    try {
      setIsProcessing(true);
      const response = await updateResource(currentGames.id, {
        ...values
      });

      setToolkits(Games.map(r => r.id === currentGames.id ? response : r));
      setFormOpen(false);
      toast.success('Games updated successfully');
    } catch (error) {
      console.error('Error updating Games:', error);
      toast.error('Failed to update Games');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!gamesToDelete) return;

    try {
      setIsProcessing(true);
      await deleteResource(gamesToDelete);
      setToolkits(Games.filter(r => r.id !== gamesToDelete));
      toast.success('Games deleted successfully');
    } catch (error) {
      console.error('Error deleting Games:', error);
      toast.error('Failed to delete Games');
    } finally {
      setIsProcessing(false);
        setIsDeleteDialogOpen(false);
        setGamesToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
          switch (status) {
          case '1':
              return <Badge className="bg-blue-500">Published</Badge>;
          case '0':
              return <Badge className="bg-yellow-500">Unpublished</Badge>;
          default:
              return <Badge>{status}</Badge>;
          }
      };
  const additionalFields = [
    {name:"title", label:"Title", type:"text", placeholder:"Enter Games title", required:true},
    {name:"published", label:"Published", type:"switch", placeholder:"Enter Games content",required:false},
    {name:"description", label:"Description", type:"textarea", placeholder:"Enter Games description",required:true},
    {name:"content", label:"Content", type:"textarea", placeholder:"Enter Games content",required:true},
    {name:"image", label:"Image URL", type:"file", placeholder:"https://example.com/image.jpg",required:false},
  ]

  const handleFormSubmit = async (values) => {
    try{
        const newToolkits: TravelResource = await addResource(values);
        setToolkits([...Games, newToolkits]);
        setFormOpen(false);
        toast.success('Games added successfully');
    } catch (error) {
        console.error('Error adding Games:', error);
        toast.error('Failed to add Games');
        throw error;
    }
  };
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    // fetchGames(newPage, pagination.limit);
  };
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Travel Games</h1>
          <p className="text-muted-foreground mt-1">
            Manage Games for travelers
          </p>
        </div>
        <Button 
          className="mt-4 md:mt-0 bg-travel-600 hover:bg-travel-700"
          onClick={handleAdd}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Games
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
      ) : Games.length === 0 ? (
        <div className="text-center p-12 border rounded-lg bg-muted/30">
          <h3 className="text-xl font-semibold mb-2">No Games found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first travel Games
          </p>
          <Button onClick={handleAdd}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Games
          </Button>
        </div>
      ) : isCardView ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Games.map((games) => (
            <ListingCard
              key={games.id}
              id={games.id}
              title={games.title}
              description={games.description || games.content || ""}
              image={typeof games.image_url === "string" ? games.image_url : games.image_url ? URL.createObjectURL(games.image_url) : ""}
              badges={[ Number(games.published) === 1 ? 'Published' : 'Unpublished' ]}
              price={null} // Provide a default price if not available
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
                        <TableHead>Title</TableHead>
                        <TableHead>Content</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Games.map((games) => (
                        <TableRow key={games.id}>
                            <TableCell className="font-medium">{games.title}</TableCell>
                            <TableCell>{games.content.slice(0, 30)}...</TableCell>
                            <TableCell>{formatDate(games.created_at)}</TableCell>
                            <TableCell>{getStatusBadge(games.published)}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleEdit.bind(null, games.id)}
                                        className="bg-travel-100 text-travel-800 border-travel-200 hover:bg-travel-200"
                                    >
                                        <Pencil className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDelete.bind(null, games.id)}
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

      {/* Add Games Dialog */}

      {!currentGames && (
        <ListingForm
          open={formOpen}
          onOpenChange={setFormOpen}
          title="Add New Games"
          fields={additionalFields}
          initialValues={{title:"",description:"",content:"",image_url:"",type:"games"}}
          onSubmit={handleFormSubmit}
        />
      )}
        {/* Pagination */}
        {/* <Pagination className="mt-6">
            {Games.length > 0 && (
            <div className="text-sm text-muted-foreground mb-2">
                Showing page {pagination.page} of {pagination.totalPages}
            </div>
            )}
            <PaginationContent>
            <PaginationPrevious
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
            />
            {[...Array(pagination.totalPages)].map((_, idx) => (
                <PaginationItem key={idx}>
                <PaginationLink
                    isActive={pagination.page === idx + 1}
                    onClick={() => handlePageChange(idx + 1)}
                >
                    {idx + 1}
                </PaginationLink>
                </PaginationItem>
            ))}
            <PaginationNext
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
            />
            </PaginationContent>
        </Pagination>
         */}
      {/* Edit Games Dialog */}
      {currentGames && (
        <ListingForm
          open={formOpen}
          onOpenChange={setFormOpen}
          title={`Update Games: ${currentGames.title}`}
          fields={additionalFields}
          initialValues={currentGames}
          onSubmit={handleUpdate}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Games"
        description={`Are you sure you want to delete the games? This action cannot be undone.`}
        isDeleting={isProcessing}
      />
    </>
  );
};

export default GamesPage;
