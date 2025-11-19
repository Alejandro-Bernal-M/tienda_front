'use client'
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import CreateHomeSectionPopup from "@/components/homeSection/CreateHomeSectionPopup";
import { useState } from "react";
import { HomeSection } from "@/lib/types";
import EditHomeSectionPopup from "@/components/homeSection/EditHomeSectionPopup";
import { deleteHomeSection } from "@/lib/features/homeSection/homeSectionsSlice";

export default function homeSections(){
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.user);
  const { homeSections } = useAppSelector((state) => state.homeSections);
  const [showPopup, setShowPopup] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [selectedHomeSection, setSelectedHomeSection] = useState<HomeSection | null>(null);
  function handleDeleteHomeSection(id: string){
    dispatch(deleteHomeSection({homeSectionId: id, token}));
  }
  return (
    <div>
      <h1>Home Sections</h1>
      <button onClick={() => setShowPopup(!showPopup) } >New home section</button>
      {showPopup && <CreateHomeSectionPopup />}
      {homeSections.map((section) => {
        return (
          <div key={section._id}>
            <h3>{section.title}</h3>
            <img src={`${process.env.NEXT_PUBLIC_IMAGES}${section.image}`} alt={section.title} width={100} />
            {section.paragraphs && section.paragraphs.map((paragraph, index) => {
              return <p key={index}>{paragraph}</p>
            })}
            <p>Order: {section.order}</p>
            <button onClick={() => {
              setSelectedHomeSection(section);
              setShowUpdatePopup(!showUpdatePopup);
            }}>Edit</button>
            <button onClick={() => {
              handleDeleteHomeSection(section._id);
            }}>Delete</button>
          </div>
        )
      })}
      {homeSections.length === 0 && <p>No home sections found</p>}
      {showUpdatePopup && selectedHomeSection && <EditHomeSectionPopup homeSection={selectedHomeSection} />}
    </div>
  );
}